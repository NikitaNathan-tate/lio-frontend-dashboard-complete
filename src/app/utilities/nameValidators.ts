import { AbstractControl } from '@angular/forms';

// Combined custom validator function for Angular
export function nameValidator(control: AbstractControl): { [key: string]: any } | null {
  const errors: { [key: string]: string } = {};

  // Check if the input is empty or consists only of whitespace
  if (!control.value || /^\s*$/.test(control.value)) {
    errors['required'] = 'Base version description is mandatary';
  }

  // Check for maximum length
  if (control.value && control.value.length > 255) {
    errors['maxlength'] = 'Base version description is restricted to 255 characters.';
  }

  // Check for invalid characters
  if (control.value && /[\\"<>|:*?\/=@!#%^&'~]/.test(control.value)) {
    errors['invalidCharacter'] = 'Base version description not allowed characters (like \\,<,>,|,:,*,?,/,=,@,!,#,%,^,&).';
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
