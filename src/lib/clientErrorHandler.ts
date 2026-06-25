import { AxiosError } from 'axios';
import { toast } from 'sonner';

interface ValidationErrorIssue {
  path: string;
  message: string;
}

interface ErrorData {
  message: string;
  error: string;
  issues?: ValidationErrorIssue[];
}

type SetErrors = (errors: Record<string, string>) => void;

const handelValidationError = (payload: {
  issues?: ValidationErrorIssue[];
  message?: string;
  setErrors?: SetErrors;
}) => {
  const { issues = [], message, setErrors } = payload;

  if (issues.length === 0) {
    toast.error('Validation Error', { description: message || 'Please check your inputs.' });
    return;
  }

  if (setErrors) {
    const formattedErrors: Record<string, string> = {};
    issues.forEach((issue) => {
      formattedErrors[issue.path] = issue.message;
    });

    setErrors(formattedErrors);
    return;
  }

  issues.forEach((issue) => {
    toast.error(issue.path, { description: issue.message });
  });
};

export const handleClientError = (
  error: unknown,
  payload?: {
    setErrors?: SetErrors;
    setErrorMsg?: (x: string) => void;
  },
) => {
  if (!(error instanceof AxiosError)) {
    console.error('Unexpected error', error);
    toast.error('An unexpected error occurred');
    return;
  }
  
  const errorData = error.response?.data as ErrorData | undefined;

  if (errorData && errorData.error === 'ValidationError') {
    return handelValidationError({
      issues: errorData.issues,
      message: errorData.message,
      setErrors: payload?.setErrors,
    });
  } else if (payload?.setErrorMsg) {
    payload.setErrorMsg(errorData?.message || error.message);
    console.log(`${errorData?.error || 'Error'}: ${error.message}`);
  } else {
    console.log(`${errorData?.error || 'Error'}: ${error.message}`);
    toast.error(errorData?.message || error.message);
  }
};
