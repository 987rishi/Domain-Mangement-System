export const formatError = (error: any): any => {
  let errors: any = {};
  error.errors?.map((issue: any) => {
    errors[issue.path?.[0]] = issue.message;
  });
  return errors;
};
