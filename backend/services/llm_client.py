from openai import OpenAI
from core.config import settings
import json
from services.rag_builder import main_prompt
from core.logger import logger

Bot = OpenAI(api_key=settings.GPT_TOKEN)

def get_answer(table_names: list, user_text: str):
    is_general_query = any(phrase in user_text.lower() for phrase in [
        'who are you', 'what can you do', 'help', 'hello', 'hi', 'hey',
        'what is your name', 'introduce yourself', 'how are you', 'thank you'
    ])
    
    if is_general_query:
        # For general queries, use a simple response
        response = Bot.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are Zap, a helpful AI assistant. Keep responses concise and friendly."},
                {"role": "user", "content": user_text}
            ],
            temperature=0.7,
            max_tokens=200,
        )
        return {
            "success": True,
            "answer_sentence": response.choices[0].message.content.strip(),
            "queries": []
        }
    
    try:
        prompt = main_prompt(table_names=table_names, user_text=user_text)
        response = Bot.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful and precise assistant and your name is Zap."},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=600,
        )
        answer_text = response.choices[0].message.content.strip()

        try:
            result = json.loads(answer_text)
            if (
                isinstance(result, dict)
                and "success" in result
                and "answer_sentence" in result
                and "queries" in result
                and isinstance(result["queries"], list)
            ):
                return result
        except json.JSONDecodeError:
            return {
                "success": True,
                "answer_sentence": answer_text,
                "queries": []
            }
            
        return {
            "success": True,
            "answer_sentence": answer_text,
            "queries": []
        }

    except Exception as e:
        logger.error(f"Error in LLM response parsing: {e}")
        return {
                "success": False,
                "answer_sentence": "Unfortunately, I did not understand your request. Please try again.",
                "queries": []
            }
