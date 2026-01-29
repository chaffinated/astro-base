import { defineAction, ActionError } from "astro:actions";
import {
  safeParse,
  summarize,
  type BaseIssue,
  type BaseSchema,
  type InferInput,
  type InferOutput,
} from 'valibot';


type ActionResponse<Payload = any> = {
  status: 'success';
  payload: Payload;
}


export const server = {
  submit: defineAction<any, 'json'>({
    accept: 'json',
    async handler(input, context) {
      return null;
    },
  }),
};


/* === VALIDATION HANDLER === */
function handleValibotParse<Validator extends BaseSchema<unknown, unknown, any>>(
  validator: Validator,
  input: InferInput<Validator>,
): ActionResponse<InferOutput<Validator>> {
  const val = safeParse(validator, input);
  
  if (!val.success) {
    throw new ActionError({
      message: summarize(val.issues),
      code: 'BAD_REQUEST',
    });
  }

  return {
    status: 'success',
    payload: val.output,
  };
}
