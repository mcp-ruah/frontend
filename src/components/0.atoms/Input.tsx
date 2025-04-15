import React, { forwardRef, KeyboardEvent } from 'react';
import styles from './Input.module.scss';

type InputProps = {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  // onKeyDown 속성 추가
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    type = 'text', 
    value, 
    onChange, 
    placeholder = '', 
    disabled = false, 
    className = '',
    onKeyDown // 이 속성을 추가
  }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`${styles.input} ${className}`}
        onKeyDown={onKeyDown} // 이 속성을 input에 전달
      />
    );
  }
);

// 디버깅을 위한 컴포넌트 이름 설정
Input.displayName = 'Input';

export default Input;