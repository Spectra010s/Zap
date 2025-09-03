import requests
from core.config import settings
from core.logger import get_logger

logger = get_logger(__name__)

ASSEMBLYAI_API_KEY = settings.ASSEMBLYAI_API_KEY
UPLOAD_ENDPOINT = "https://api.assemblyai.com/v2/upload"
TRANSCRIPT_ENDPOINT = "https://api.assemblyai.com/v2/transcript"

headers = {
    "authorization": ASSEMBLYAI_API_KEY,
    "content-type": "application/json"
}

def transcribe_audio(audio_bytes: bytes) -> str:
    """
    Upload audio bytes to AssemblyAI and get transcription text.
    """
    try:
        logger.debug(f"Transcribing audio data size: {len(audio_bytes)} bytes")
        
        upload_response = requests.post(
            UPLOAD_ENDPOINT,
            headers={
                "authorization": ASSEMBLYAI_API_KEY,
                "content-type": "application/octet-stream"
            },
            data=audio_bytes
        )
        
        logger.debug(f"Upload response status: {upload_response.status_code}")
        logger.debug(f"Upload response: {upload_response.text}")
        
        upload_response.raise_for_status()
        upload_url = upload_response.json()['upload_url']
        logger.info(f"Audio uploaded successfully. URL: {upload_url}")

        logger.debug("Sending transcription request...")
        transcript_request = {
            "audio_url": upload_url,
            "language_code": "en",  # or "fa" for Persian if supported
            "word_boost": ["Zap", "table", "spreadsheet", "data"],
            "format_text": True
        }
        
        logger.debug(f"Transcription request: {transcript_request}")
        transcript_response = requests.post(
            TRANSCRIPT_ENDPOINT,
            json=transcript_request,
            headers=headers
        )
        
        logger.debug(f"Transcription response status: {transcript_response.status_code}")
        logger.debug(f"Transcription response: {transcript_response.text}")
        
        transcript_response.raise_for_status()
        transcript_data = transcript_response.json()
        transcript_id = transcript_data.get('id')
        
        if not transcript_id:
            error_msg = "No transcript ID in response"
            logger.error(error_msg)
            raise Exception(error_msg)
            
        logger.info(f"Transcription started. ID: {transcript_id}")

        import time
        max_attempts = 30  
        attempt = 0
        
        while attempt < max_attempts:
            logger.debug(f"Checking transcription status (attempt {attempt + 1}/{max_attempts})...")
            polling_response = requests.get(
                f"{TRANSCRIPT_ENDPOINT}/{transcript_id}",
                headers=headers
            )
            polling_response.raise_for_status()
            
            result = polling_response.json()
            status = result.get('status')
            
            logger.debug(f"Status: {status}")
            
            if status == 'completed':
                text = result.get('text', '').strip()
                if len(text) > 100:
                    logger.info(f"Transcription completed. Text: {text[:100]}...")
                else:
                    logger.info(f"Transcription completed. Text: '{text}'")
                
                logger.debug(f"Full transcription result: {result}")
                
                if not text:
                    warning_msg = (
                        "Received empty transcription text. Possible issues:\n"
                        "1. The audio might be too quiet or contain no speech\n"
                        "2. The audio format might not be properly supported\n"
                        "3. The speech might not be in the expected language"
                    )
                    logger.warning(warning_msg)
                
                return text
                
            elif status == 'error':
                error_msg = result.get('error', 'Unknown error')
                logger.error(f"Transcription failed: {error_msg}")
                raise Exception(f"Transcription failed: {error_msg}")
                
            attempt += 1
            time.sleep(1)
            
        error_msg = "Transcription timed out"
        logger.error(error_msg)
        raise Exception(error_msg)
        
    except requests.exceptions.RequestException as e:
        error_msg = f"Request error during transcription: {str(e)}"
        logger.error(error_msg)
        if hasattr(e, 'response') and e.response is not None:
            logger.error(f"Response content: {e.response.text}")
        raise Exception(f"Error during transcription request: {str(e)}")
        
    except Exception as e:
        error_msg = f"Unexpected error during transcription: {str(e)}"
        logger.error(error_msg)
        raise
    
    return ''
