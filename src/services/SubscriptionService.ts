import {SoapClient} from '../utils/soap';
import {cacheService} from '../database/cache';

interface Subscriber {
  email: string;
  subscriptionEndTime: string;
  subscriptionStartTime: string;
  id: string;
}

class SubscriptionService {
  private client: SoapClient;
  private readonly SUBSCRIBER_NAMESPACE = 'subscriber:';

  constructor() {
    const url = process.env.SOAP_SERVICE_URL;

    if (!url) {
      throw new Error('Soap service url is not defined');
    }

    this.client = new SoapClient(url);
  }

  public async getSubscriber(id: number): Promise<Subscriber | null> {
    const key = `${this.SUBSCRIBER_NAMESPACE}${id}`;

    const cached = cacheService.get<Subscriber | null>(key);

    if (cached !== undefined) {
      return cached;
    }

    const result = (await this.client.invoke('getSubscriber', {
      arg0: id.toString(),
    })) as Subscriber | null;

    cacheService.set<Subscriber | null>(key, result, 60 * 10);

    return result;
  }
}

export const subscriptionService = new SubscriptionService();
