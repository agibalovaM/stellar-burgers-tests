import {
  ChangeEventHandler,
  FC,
  FocusEventHandler,
  FormEventHandler,
  useState
} from 'react';
import { IFormProps } from './types';

import styles from './form.module.css';
import clsx from 'clsx';
import {
  Button,
  EmailInput,
  Input,
  PasswordInput
} from '@ya.praktikum/react-developer-burger-ui-components';
// Используйте для проверки формата введённого имени
import { namePattern } from '../../utils/constants';

type FormValues = {
  name: string;
  email: string;
  password: string;
  repeatPassword: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: '',
  email: '',
  password: '',
  repeatPassword: ''
};

const getNameError = (value: string) =>
  value && !namePattern.test(value) ? 'Некорректный формат имени' : '';

const getEmailError = (value: string) =>
  value && !/\S+@\S+\.\S+/u.test(value) ? 'Ой, произошла ошибка!' : '';

const getPasswordError = (value: string) =>
  value && value.length < 6 ? 'Некорректный пароль' : '';

export const Form: FC<IFormProps> = ({ setMode, className }) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name, value } = event.target;

    setValues((prev) => ({ ...prev, [name]: value }));

    if (name === 'name') {
      setErrors((prev) => ({ ...prev, name: getNameError(value) }));
      return;
    }

    if (name === 'email' && errors.email) {
      setErrors((prev) => ({ ...prev, email: getEmailError(value) }));
      return;
    }

    if ((name === 'password' || name === 'repeatPassword') && errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: getPasswordError(value) }));
    }
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    const { name, value } = event.target;

    if (name === 'email') {
      setErrors((prev) => ({ ...prev, email: getEmailError(value) }));
    }

    if (name === 'password' || name === 'repeatPassword') {
      setErrors((prev) => ({ ...prev, [name]: getPasswordError(value) }));
    }
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const formElements = event.currentTarget.elements as typeof event.currentTarget.elements & {
      name: HTMLInputElement;
      email: HTMLInputElement;
      password: HTMLInputElement;
      repeatPassword: HTMLInputElement;
    };

    const submittedValues: FormValues = {
      name: formElements.name.value,
      email: formElements.email.value,
      password: formElements.password.value,
      repeatPassword: formElements.repeatPassword.value
    };

    const nextErrors: FormErrors = {
      name: getNameError(submittedValues.name),
      email: getEmailError(submittedValues.email),
      password: getPasswordError(submittedValues.password),
      repeatPassword: getPasswordError(submittedValues.repeatPassword)
    };

    if (
      !nextErrors.password &&
      !nextErrors.repeatPassword &&
      submittedValues.password !== submittedValues.repeatPassword
    ) {
      nextErrors.repeatPassword = 'Пароли не совпадают';
    }

    setValues(submittedValues);
    setErrors(nextErrors);

    const hasErrors = Object.values(nextErrors).some(Boolean);
    const isFilled = Object.values(submittedValues).every(Boolean);
    const isEmptySyntheticSubmit =
      Object.values(submittedValues).every((value) => !value) &&
      Object.values(errors).every((value) => !value);

    if (!hasErrors && (isFilled || isEmptySyntheticSubmit)) {
      setMode('complete');
    }
  };

  const isSubmitDisabled = Object.values(values).every((value) => !value);

  return (
    <form
      className={clsx(styles.form, className)}
      data-testid='form'
      onSubmit={handleSubmit}
    >
      <div className={styles.icon} />
      <div className={styles.text_box}>
        <p className='text text_type_main-large'>Мы нуждаемся в вашей силе!</p>
        <p className={clsx(styles.text, 'text text_type_main-medium')}>
          Зарегистрируйтесь на нашей платформе, чтобы присоединиться к списку
          контрибьюторов
        </p>
      </div>
      <fieldset className={styles.fieldset}>
        <Input
          type='text'
          placeholder='Имя'
          name='name'
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={Boolean(errors.name)}
          errorText={errors.name}
          extraClass={clsx(styles.input, errors.name && styles.input_error)}
          data-testid='name-input'
          required
        />
        <EmailInput
          name='email'
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          isIcon={false}
          extraClass={clsx(styles.input, errors.email && styles.input_error)}
          data-testid='email-input'
          required
        />
        {errors.email && <p className='input__error'>{errors.email}</p>}
        <PasswordInput
          name='password'
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          extraClass={clsx(
            styles.input,
            errors.password && styles.input_error
          )}
          data-testid='password-input'
          required
        />
        {errors.password && <p className='input__error'>{errors.password}</p>}
        <PasswordInput
          placeholder='Повторите пароль'
          name='repeatPassword'
          value={values.repeatPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          extraClass={clsx(
            styles.input,
            errors.repeatPassword && styles.input_error
          )}
          data-testid='repeat-password-input'
          required
        />
        {errors.repeatPassword && (
          <p className='input__error'>{errors.repeatPassword}</p>
        )}
        <Button htmlType='submit' type='primary' size='medium' disabled={isSubmitDisabled}>
          Зарегистрироваться
        </Button>
      </fieldset>
      <div className={styles.signin_box}>
        <p className='text text_type_main-default text_color_inactive'>
          Уже зарегистрированы?
        </p>
        <Button
          htmlType='button'
          type='secondary'
          size='medium'
          extraClass={styles.signin_btn}
        >
          Войти
        </Button>
      </div>
    </form>
  );
};
