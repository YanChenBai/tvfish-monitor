class STT {
  escape(v: any) {
    return v.toString().replace(/@/g, '@A').replace(/\//g, '@S');
  }

  unescape(v: any) {
    if (!v) return;
    return v.toString().replace(/@A/g, '@').replace(/@S/g, '/');
  }

  deserialize(raw: string): any {
    if (!raw) return;
    if (raw.includes('//')) {
      return raw
        .split('//')
        .filter((e) => e !== '')
        .map((item) => this.deserialize(item));
    }

    if (raw.includes('@=')) {
      return raw
        .split('/')
        .filter((e) => e !== '')
        .reduce((o: any, s) => {
          const [k, v] = s.split('@=');
          o[k] = this.deserialize(this.unescape(v));
          return o;
        }, {});
    } else if (raw.includes('@A=')) {
      return this.deserialize(this.unescape(raw));
    } else {
      return raw.toString();
    }
  }
}

export { STT };
