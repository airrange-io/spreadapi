'use client';

import React from 'react';
import { Button } from 'antd';
import { PlusOutlined, TableOutlined } from '@ant-design/icons';
import { useTranslation } from '@/lib/i18n';

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
  const { t } = useTranslation();

  const getCellAddress = (row: number, col: number) => {
    let columnLetter = '';
    let tempCol = col;
    while (tempCol >= 0) {
      columnLetter = String.fromCharCode(65 + (tempCol % 26)) + columnLetter;
      tempCol = Math.floor(tempCol / 26) - 1;
    }
    return `${columnLetter}${row + 1}`;
  };

  const getSelectionInfo = () => {
    if (!currentSelection || !spreadInstance || !spreadsheetReady) {
      return { address: null, type: null, disabled: true };
    }

    const { isSingleCell, hasFormula, isRange, row, col, rowCount, colCount } = currentSelection;
    const cellRef = getCellAddress(row, col);
    const sheetName = currentSelection.sheetName || 'Sheet1';

    let fullAddress: string;
    if (isRange) {
      const endCellRef = getCellAddress(row + rowCount - 1, col + colCount - 1);
      fullAddress = `${sheetName}!${cellRef}:${endCellRef}`;
    } else {
      fullAddress = `${sheetName}!${cellRef}`;
    }

    const alreadyExists = [...inputs, ...outputs].some(param => param.address === fullAddress);

    let type: 'input' | 'output';
    if (isRange || hasFormula) {
      type = 'output';
    } else {
      type = 'input';
    }

    return { address: fullAddress, type, disabled: alreadyExists, isRange };
  };

  const info = getSelectionInfo();
  const hasSelection = !!info.address;

  return (
    <div
      style={{
        padding: '12px 12px',
        background: 'white',
        flex: '0 0 auto',
        borderTop: '1px solid #f0f0f0',
      }}
    >
      <div ref={buttonRef} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Cell Selection Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          background: hasSelection ? '#F5F3FF' : '#f8f7fa',
          borderRadius: 10,
          border: '1px solid #eee',
        }}>
          {/* Status dot - only when selected */}
          {hasSelection && (
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: info.type === 'input' ? '#1665A1' : '#7B3AED',
              flexShrink: 0,
            }} />
          )}

          {/* Address */}
          <div style={{
            flex: 1,
            fontSize: 14,
            fontWeight: hasSelection ? 500 : 400,
            color: hasSelection ? '#1a1a1a' : '#aaa',
            textAlign: hasSelection ? 'left' : 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {hasSelection ? info.address : t('params.noCellSelected')}
          </div>

          {/* IN/OUT Badge */}
          {hasSelection && info.type && !info.disabled && (
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: info.type === 'input' ? '#1665A1' : '#7B3AED',
              background: info.type === 'input' ? '#E8F2FB' : '#F0EEFF',
              borderRadius: 6,
              padding: '2px 8px',
              flexShrink: 0,
            }}>
              {info.type === 'input' ? 'IN' : 'OUT'}
            </span>
          )}

          {/* Already exists indicator */}
          {hasSelection && info.disabled && (
            <span style={{
              fontSize: 11,
              color: '#aaa',
              flexShrink: 0,
            }}>
              {t('params.alreadyAdded')}
            </span>
          )}
        </div>

        {/* Add Button */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{
            width: '100%',
            height: 42,
            borderRadius: 10,
            background: hasSelection && !info.disabled ? '#9233E9' : undefined,
            borderColor: hasSelection && !info.disabled ? '#9233E9' : undefined,
            boxShadow: 'none',
          }}
          onClick={onAddFromSelection}
          disabled={!hasSelection || info.disabled}
        >
          {t('params.addAsParameter')}
        </Button>

        {/* Editable Area Button (only for ranges) */}
        {info.isRange && !info.disabled && (
          <Button
            type="default"
            icon={<TableOutlined />}
            style={{
              width: '100%',
              height: 36,
              borderRadius: 10,
            }}
            onClick={onAddAsEditableArea}
            disabled={process.env.NODE_ENV !== 'development'}
          >
            {t('params.addAsEditableArea')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddParameterButton;
