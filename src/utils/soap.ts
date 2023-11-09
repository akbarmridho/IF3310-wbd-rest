import xmlJs from 'xml-js';

type Param = {
  [key: string]: string | undefined;
};

export class SoapClient {
  private baseUrl: string;
  private readonly apiKey: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;

    const apiKey = process.env.SOAP_API_KEY;

    if (!apiKey) {
      throw new Error('Soap api key is not exists');
    }

    this.apiKey = apiKey;
  }

  public async invoke(method: string, parameters: Param) {
    const headers = {
      'Content-Type': 'text/xml; charset=utf-8',
      Authorization: this.apiKey,
    };

    const xml = this.buildXmlRequest(method, parameters);
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      body: xml,
      headers,
    });

    return this.parseXmlToJson(await response.text(), method);
  }

  private buildXmlRequest(method: string, parameters: Param) {
    return `
      <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
        <Body>
          <${method} xmlns="http://services.listwibuku.com/">
            ${this.buildXmlParameters(parameters)}
          </${method}>
        </Body>
      </Envelope>
    `;
  }

  private buildXmlParameters(parameters: Param) {
    let base = '';

    Object.keys(parameters).map(key => {
      base =
        base +
        `<${key} xmlns="">${
          parameters[key as keyof typeof parameters]
        }</${key}>`;
    });

    return base;
  }

  private parseXmlToJson(xml: string, method: string) {
    const json = JSON.parse(xmlJs.xml2json(xml, {compact: true, spaces: 4}));
    const returnVal =
      json['S:Envelope']['S:Body']['ns2:' + method + 'Response']['return'];

    if (!returnVal) {
      return null;
    }

    return this.buildResponseJSON(returnVal);
  }

  private buildResponseJSON(json: any) {
    if (Array.isArray(json)) {
      return json.map(item => this.flatten(item));
    }

    return this.flatten(json);
  }

  private flatten(json: any) {
    const response: any = {};

    Object.keys(json).forEach(key => {
      const value = json[key as keyof typeof json];
      response[key] = value['_text' as keyof typeof value];
    });

    return response;
  }
}
