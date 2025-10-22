'use client';

import React from 'react';
import { Button } from 'antd';
import { PlusOutlined, TableOutlined } from '@ant-design/icons';

interface AddParameterButtonProps {
  currentSelection: any;
  spreadsheetReady: boolean;
  spreadInstance: any;
  inputs: any[];
  outputs: any[];
  isCompact?: boolean;
  onAddFromSelection: () => void;
  onAddAsEditableArea: () => void;
  buttonRef?: React.RefObject<HTMLDivElement>;
}

const AddParameterButton: React.FC<AddParameterButtonProps> = ({
  currentSelection,
  spreadsheetReady,
  spreadInstance,
  inputs,
  outputs,
  isCompact = false,
  onAddFromSelection,
  onAddAsEditableArea,
  buttonRef,
}) => {
  const getCellAddress = (row: number, col: number) => {
    let columnLetter = '';
    let tempCol = col;

    while (tempCol >= 0) {
      columnLetter = String.fromCharCode(65 + (tempCol % 26)) + columnLetter;
      tempCol = Math.floor(tempCol / 26) - 1;
    }

    return `${columnLetter}${row + 1}`;
  };

  const getAddButtonInfo = () => {
    if (!spreadInstance) {
      return { 
        text: isCompact ? 'Switch to Workbook' : 'Switch to Workbook view to add parameters', 
        disabled: true 
      };
    }
    
    if (!spreadsheetReady) {
      return { text: 'Loading spreadsheet...', disabled: true };
    }

    if (!currentSelection) {
      return { text: 'Add Selection as Parameter', disabled: true };
    }

    const { isSingleCell, hasFormula, isRange, row, col, rowCount, colCount } = currentSelection;
    const cellRef = getCellAddress(row, col);

    const sheetName = currentSelection.sheetName || 'Sheet1';

    const isAlreadyInParameters = () => {
      if (isRange) {
        const endCellRef = getCellAddress(row + rowCount - 1, col + colCount - 1);
        const rangeAddress = `${sheetName}!${cellRef}:${endCellRef}`;
        return [...inputs, ...outputs].some(param => param.address === rangeAddress);
      } else {
        const cellAddress = `${sheetName}!${cellRef}`;
        return [...inputs, ...outputs].some(param => param.address === cellAddress);
      }
    };

    const alreadyExists = isAlreadyInParameters();

    if (isRange) {
      const endCellRef = getCellAddress(row + rowCount - 1, col + colCount - 1);
      return {
        text: alreadyExists ? `${cellRef}:${endCellRef} already added` : `Add ${cellRef}:${endCellRef} as Output`,
        type: 'output' as const,
        disabled: alreadyExists
      };
    } else if (hasFormula) {
      return {
        text: alreadyExists ? `${cellRef} already added` : `Add ${cellRef} as Output`,
        type: 'output' as const,
        disabled: alreadyExists
      };
    } else {
      return {
        text: alreadyExists ? `${cellRef} already added` : `Add ${cellRef} as Input`,
        type: 'input' as const,
        disabled: alreadyExists
      };
    }
  };

  const buttonInfo = getAddButtonInfo();
  const isRange = currentSelection && (currentSelection.rowCount > 1 || currentSelection.colCount > 1);

  return (
    <div
      style={{
        padding: '16px',
        paddingTop: 0,
        background: 'white',
        flex: '0 0 auto'
      }}
    >
      <div ref={buttonRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ width: '100%', height: 48 }}
          onClick={onAddFromSelection}
          disabled={buttonInfo.disabled || !spreadInstance || !spreadsheetReady}
        >
          {buttonInfo.text}
        </Button>

        {isRange && !buttonInfo.disabled && (
          <Button
            type="default"
            icon={<TableOutlined />}
            style={{ width: '100%', height: 40 }}
            onClick={onAddAsEditableArea}
            disabled={!spreadInstance || !spreadsheetReady}
          >
            Add Selection as Editable Area (for AI)
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddParameterButton;