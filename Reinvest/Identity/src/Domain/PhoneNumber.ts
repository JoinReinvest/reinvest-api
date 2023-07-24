export class PhoneNumber {
  private phoneNumber: string;
  private countryCode: string;
  private _isSmsAllowed: boolean;

  constructor(countryCode: string, phoneNumber: string, isSmsAllowed: boolean = true) {
    if (!countryCode || !phoneNumber) {
      throw new Error('Country code and phone number are required');
    }

    this.countryCode = `+${this.trim(countryCode)}`;
    this.phoneNumber = this.trim(phoneNumber);
    this._isSmsAllowed = isSmsAllowed;
  }

  private trim(value: string): string {
    return value.replace(/\+/g, '').replace(/-/g, '').replace(/\s+/g, '');
  }

  public getFullPhoneNumber(): string {
    return this.countryCode + this.phoneNumber;
  }

  getCountryCode(): string {
    return this.countryCode;
  }

  getPhoneNumber(): string {
    return this.phoneNumber;
  }

  isSmsAllowed(): boolean {
    return this._isSmsAllowed;
  }

  isUSNumber(): boolean {
    return this.countryCode === '+1';
  }
}
