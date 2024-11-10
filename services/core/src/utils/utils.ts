const utils = {
  replacer(key: string, value: any): any {
    if (typeof value === 'bigint') {
      return value.toString();
    } else {
      return value;
    }
  },
  // Add more functions here as needed
};

export { utils };
