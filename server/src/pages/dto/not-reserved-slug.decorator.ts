import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';
import { RESERVED_SLUGS } from '../reserved-slugs';

export function IsNotReservedSlug(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotReservedSlug',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && !RESERVED_SLUGS.has(value.toLowerCase());
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is a reserved value and cannot be used as a slug.`;
        }
      }
    });
  };
}
