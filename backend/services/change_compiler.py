from typing import Dict, Any
import re
from db.crud.table import get_table_by_id, save_table_by_id

class PromptCompiler:
    def __init__(self, user_id: int, table_id: int):
        self.user_id = user_id
        self.table_id = table_id
        self.data = get_table_by_id(user_id=self.user_id, table_id=self.table_id)
        if not self.data:
            raise ValueError(f"Table with ID {table_id} for user {user_id} not found")

        self.operations = {
            'AR': self._add_row,
            'DR': self._delete_row,
            'EC': self._edit_cell,
            'AC': self._add_column,
            'DC': self._delete_column
        }
        self.patterns = {
            'AR': r'AR\s*\[([^\]]+)\]',
            'DR': r'DR\s*(\d+)',
            'EC': r'EC\s*\((\d+)\s*,\s*([^)]+)\)\s*"([^"]*)"',
            'AC': r'AC\s*"([^"]*)"',
            'DC': r'DC\s*"([^"]*)"'
        }

    def _save_table_data(self):
        save_table_by_id(user_id=self.user_id, table_id=self.table_id, updated_table=self.data)

    def compile(self, prompt: str) -> Dict[str, Any]:
        try:
            prompt_original = prompt
            prompt = prompt.strip()
            op_code = prompt[:2].upper()
            if op_code not in self.operations:
                raise ValueError(f"Invalid operation code: {op_code}")

            match = re.search(self.patterns[op_code], prompt)
            if not match:
                raise ValueError("Could not parse arguments for operation")

            result_msg = self.operations[op_code](*match.groups())

            self._save_table_data()

            return {
                'status': 'success',
                'operation': op_code,
                'prompt': prompt_original,
                'data': self.data,
                'result': result_msg
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e),
                'data': self.data
            }

    def _get_column_index(self, col_name: str) -> int:
        col_name = col_name.strip().lower()
        for idx, col in enumerate(self.data['data']['columns']):
            if col['name'].lower() == col_name:
                return idx
        raise ValueError(f"Column '{col_name}' not found")

    def _add_row(self, values_str: str) -> str:
        values = [v.strip() for v in values_str.split(',')]
        col_count = len(self.data['data']['columns'])
        if len(values) != col_count:
            raise ValueError(f"Expected {col_count} values, got {len(values)}")

        converted_values = []
        for i, val in enumerate(values):
            col_type = self.data['data']['columns'][i]['type']
            converted_values.append(self._convert_value(val, col_type))

        self.data['data']['rows'].append(converted_values)
        return f"Added row with values: {converted_values}"

    def _delete_row(self, row_index: str) -> str:
        idx = int(row_index)
        rows = self.data['data']['rows']
        if idx < 0 or idx >= len(rows):
            raise ValueError(f"Row index {idx} out of range")
        rows.pop(idx)
        return f"Deleted row at index {idx}"

    def _edit_cell(self, row_idx: str, col_name: str, new_value: str) -> str:
        row = int(row_idx)
        col_idx = self._get_column_index(col_name)
        rows = self.data['data']['rows']

        if row < 0 or row >= len(rows):
            raise ValueError(f"Row index {row} out of range")

        col_type = self.data['data']['columns'][col_idx]['type']
        converted_value = self._convert_value(new_value, col_type)
        
        # Update the specific cell
        self.data['data']['rows'][row][col_idx] = converted_value
        return f"Updated cell at ({row}, {col_name}) to '{converted_value}'"

    def _add_column(self, col_name: str) -> str:
        col_name = col_name.strip()
        for col in self.data['data']['columns']:
            if col['name'].lower() == col_name.lower():
                raise ValueError(f"Column '{col_name}' already exists")

        self.data['data']['columns'].append({"name": col_name, "type": "string"})

        for row in self.data['data']['rows']:
            row.append("")

        return f"Added column '{col_name}'"

    def _delete_column(self, col_name: str) -> str:
        col_idx = self._get_column_index(col_name)
        self.data['data']['columns'].pop(col_idx)
        for row in self.data['data']['rows']:
            row.pop(col_idx)
        return f"Deleted column '{col_name}'"

    def _convert_value(self, val: str, col_type: str):
        val = val.strip()
        if col_type == 'integer':
            if val.isdigit() or (val.startswith('-') and val[1:].isdigit()):
                return int(val)
            else:
                raise ValueError(f"Cannot convert '{val}' to integer")
        elif col_type == 'float':
            try:
                return float(val)
            except:
                raise ValueError(f"Cannot convert '{val}' to float")
        else:

            return str(val)
