import React from 'react';

interface TProps {
    keys: string
    insertions: string
    langPropName: string
}

interface I18nClassProps {
    defLang: string, 
    langPropName: string,
    pathToI18n: string,
    ext?: string, 
    filename?: string
}

function translator (props: I18nClassProps) {
    const {defLang, langPropName, pathToI18n, filename  = '', ext = 'json'} = props
    class Language {
        language: string
        path: string
        filename: string
        ext: string
        i18n: {[key: string]: any}
        constructor(defLang: string, pathToI18n: string, filename: string, ext: string) {
            this.language = defLang;
            this.path = pathToI18n;
            this.ext = ext;
            this.filename = filename
            this.i18n = {}
            this.defineSource(defLang);
        }

        defineSource(language: string) {
            let pathToLocale: string
            if (this.filename) {
                pathToLocale = `${this.path}${language}/${this.filename}.${this.ext}`
            }
            pathToLocale = `${this.path}${this.language}.${this.ext}`
            try {
                this.i18n = require(pathToLocale);
                this.language = language;
            } catch(e) {
                console.error(e)
            }
        }
    }

    const i18nLang = new Language(defLang, pathToI18n, filename, ext);

    function translate(props: TProps) {
        console.log(props)
        let source;
        let string = i18nLang.i18n;
        let {keys, insertions = []} = props;
        // @ts-ignore
        let language = props[langPropName];
        if (!language) {
           throw new Error('Property "language" is undefined')
        }
        if (!keys) { 
            throw new Error(`Incorrect props for i18n: ${JSON.stringify(props)}`)
        }
        const Keys = (Array.isArray(keys) && keys) || (typeof keys === 'string' && keys.split('.'));
        if (!Keys || !Keys.length)
            throw new Error("Invalid 'keys' property passed to react-redux-translate! 'Keys' must be array or string with keys and dots as delimiters");
        if (language !== i18nLang.language) {
            i18nLang.defineSource(language);
        }
        source = i18nLang.i18n;

        if (!source || (source && typeof source !== 'object' && !source[Keys[0]])) {
            throw new Error("Obtained language source is not valid.");
        }

        try {
            // @ts-ignore
            string = Keys.reduce((acc: any, key: string) => acc[key], source);
        }catch(err) {
            console.error(err);
            throw new Error("Invalid props passed to react-redux-translate. Obtained language source is not valid.")
        }

        if (typeof string !== 'string') {
            throw new Error(`Invalid 'keys' property passed to react-redux-translate! Value to return ${JSON.stringify(string)} Keys ${JSON.stringify(keys)}`);
        }
        if (insertions.length) {
            // @ts-ignore
            return insertions.reduce((acc, ins) => acc.replace('{{}}', ins), string)
        }
        return string;
    };
    
    translate.source = i18nLang;

    return translate;
}

export default translator;
