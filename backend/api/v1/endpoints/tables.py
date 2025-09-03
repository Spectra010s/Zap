from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, validator
from db.crud.table import (
    add_table,
    get_user_table_names,
    get_table_by_id,
    delete_table,
    save_table_by_id
)
from core.logger import logger
from auth import dependencies
from core.logger import logger
from services.change_compiler import PromptCompiler 

router = APIRouter()


class TableCreateSchema(BaseModel):
    table_json: dict

    @validator("table_json")
    def validate_format(cls, v):
        if "name" not in v or not isinstance(v["name"], str):
            raise ValueError("Missing or invalid 'name' in table_json")
        if "data" not in v or not isinstance(v["data"], dict):
            raise ValueError("Missing or invalid 'data' in table_json")
        if "columns" not in v["data"] or "rows" not in v["data"]:
            raise ValueError("Missing 'columns' or 'rows' in data")
        return v


@router.post("/add-table")
def create_table_endpoint(
    payload: TableCreateSchema,
    current_user=Depends(dependencies.get_current_user)
):
    try:
        new_table = add_table(user_id=current_user.id, table_json=payload.table_json)
        return new_table
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in create_table_endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal Error")


@router.get("/tables-names")
def read_user_table_names(
    current_user=Depends(dependencies.get_current_user),
):
    if not current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    tables = get_user_table_names(current_user.id)
    return {"tables": tables}


@router.get("/tables/{table_id}")
def read_table_data(
    table_id: int,
    current_user=Depends(dependencies.get_current_user),
):
    table = get_table_by_id(current_user.id, table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    return {"table": table}


@router.delete("/tables/{table_id}")
def delete_table_endpoint(
    table_id: int,
    current_user=Depends(dependencies.get_current_user),
):
    success = delete_table(current_user.id, table_id)
    if not success:
        raise HTTPException(status_code=404, detail="Table not found or not authorized")
    return {"detail": "Table deleted successfully"}

class TableUpdateSchema(BaseModel):
    table_json: dict

    @validator("table_json")
    def validate_format(cls, v):
        if "name" not in v or not isinstance(v["name"], str):
            raise ValueError("Missing or invalid 'name' in table_json")
        if "data" not in v or not isinstance(v["data"], dict):
            raise ValueError("Missing or invalid 'data' in table_json")
        if "columns" not in v["data"] or "rows" not in v["data"]:
            raise ValueError("Missing 'columns' or 'rows' in data")
        return v


@router.put("/tables/{table_id}")
def update_table_endpoint(
    table_id: int,
    payload: TableUpdateSchema,
    current_user=Depends(dependencies.get_current_user)
):
    try:
        # Get the existing table to verify ownership
        existing_table = get_table_by_id(current_user.id, table_id)
        if not existing_table:
            raise HTTPException(status_code=404, detail="Table not found or not authorized")
        
        # Update the table data
        updated_table = {
            "user": current_user.id,
            "ID": table_id,
            **payload.table_json
        }
        
        if not save_table_by_id(current_user.id, table_id, updated_table):
            raise HTTPException(status_code=500, detail="Failed to update table")
            
        return updated_table
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in update_table_endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal Error")


class PromptCompileRequest(BaseModel):
    prompts: list[str]
    table_id: int 

@router.post("/compile-prompt")
def compile_prompt_endpoint(
    request: PromptCompileRequest,
    current_user=Depends(dependencies.get_current_user),
):
    tables = get_user_table_names(current_user.id)
    if not tables:
        raise HTTPException(status_code=404, detail="Table not found")
    if request.table_id not in [t["ID"] for t in tables]:
        raise HTTPException(status_code=404, detail="Table not found")
    
    flag = True
    compiler = PromptCompiler(table_id=request.table_id, user_id=current_user.id)
    for c in request.prompts:
        result = compiler.compile(c)
        
        if result['status'] == 'error':
            flag = False
            continue
    if flag == False:
        raise HTTPException(status_code=400, detail="Error in compiling prompts")
    
    return result

