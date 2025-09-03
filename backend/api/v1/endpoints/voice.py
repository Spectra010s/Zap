from fastapi import APIRouter, UploadFile, File, Depends, Form
from fastapi.responses import JSONResponse
from services.voice_to_text import transcribe_audio
from core.logger import logger
from auth import dependencies
from sqlalchemy.orm import Session
from db.session import get_db
from services.manager import manager

router = APIRouter()

@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(None),
    table_name: str = Form(None),
    text: str = Form(None),
    user=Depends(dependencies.get_current_user),
):
    """
    Receive audio file and return transcribed text.
    """
    try:
        if text is None and audio is None:
            return JSONResponse(content={"error": "One of the audio or text is requerd to use this api"}, status_code=400)
        # use text if exist
        if text and isinstance(text, str):
            res = manager(user_text=text, user_id=user.id, table=table_name)
            return JSONResponse(content={"text": res})

        # handle audio file
        if audio:
            contents = await audio.read()
            
            if not contents:
                return JSONResponse(
                    content={"error": "Empty audio file"},
                    status_code=400
                )
                
            print(f"Received audio file: {audio.filename}, size: {len(contents)} bytes, content-type: {audio.content_type}")
            
            try:
                user_text = transcribe_audio(contents)
                
                if not user_text or not user_text.strip():
                    return JSONResponse(
                        content={
                            "error": "Could not transcribe audio. Please ensure the audio is clear and contains speech.",
                            "details": "The speech recognition service did not return any text. This could be due to background noise, unclear speech, or the audio being too short."
                        },
                        status_code=400
                    )
                    
                res = manager(user_text=user_text, user_id=user.id, table=table_name)
                return JSONResponse(content={"text": res})
                
            except Exception as transcribe_error:
                logger.error(f"Transcription error: {str(transcribe_error)}")
                return JSONResponse(
                    content={"error": f"Error transcribing audio: {str(transcribe_error)}"},
                    status_code=500
                )
                
    except Exception as e:
        logger.error(f"Error in transcribe endpoint: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
