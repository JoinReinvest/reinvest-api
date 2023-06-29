import { UUID } from 'HKEKTypes/Generics';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { DataJson } from 'Portfolio/Domain/Property';
import { ValidationErrorEnum, ValidationErrorType } from 'Portfolio/Domain/Validation';
import { Address, AddressInput } from 'Portfolio/ValueObject/Address';
import { Image } from 'Portfolio/ValueObject/Image';
import { ImpactMetrics, ImpactMetricsInput } from 'Portfolio/ValueObject/ImpactMetrics';
import { KeyMetrics, KeyMetricsInput } from 'Portfolio/ValueObject/KeyMetrics';
import { Location, LocationInput } from 'Portfolio/ValueObject/Location';
import { POI, POIInput } from 'Portfolio/ValueObject/POI';
import { DomainEvent } from 'SimpleAggregator/Types';

export type UpdatePropertyInput = DataJson;

export class UpdateProperty {
  private portfolioRepository: PortfolioRepository;

  constructor(portfolioRepository: PortfolioRepository) {
    this.portfolioRepository = portfolioRepository;
  }

  public static getClassName = (): string => 'UpdateProperty';

  public async execute(input: UpdatePropertyInput, propertyId: number, portfolioId: UUID): Promise<ValidationErrorType[]> {
    const events: DomainEvent[] = [];
    const errors = [];

    const property = await this.portfolioRepository.getById(propertyId);

    if (!property) {
      errors.push(<ValidationErrorType>{
        type: ValidationErrorEnum.EMPTY_VALUE,
        field: 'updateProperty',
      });

      return errors;
    }

    const inputKeys = Object.keys(input) as (keyof UpdatePropertyInput)[];

    for (const step of inputKeys) {
      try {
        const data = input[step];

        if (data === null) {
          errors.push(<ValidationErrorType>{
            type: ValidationErrorEnum.EMPTY_VALUE,
            field: step,
          });
          continue;
        }

        switch (step) {
          case 'name':
            property.setName(data as string);
            break;
          case 'address':
            property.setAddress(Address.create(data as AddressInput));
            break;
          case 'location':
            property.setLocation(Location.create(data as LocationInput));
            break;
          case 'POIs':
            const pois = data as POIInput[];
            pois.forEach(({ image, description, name }) => {
              property.addPOI(POI.create({ description, name, image, path: portfolioId }));
            });
            break;
          case 'image':
            const id = data as string;
            const event = property.replaceImage(Image.create({ id, path: portfolioId }));

            if (event) {
              events.push(event);
            }

            break;
          case 'gallery':
            const ids = data as string[];
            ids.forEach(id => {
              property.addGalleryImage(Image.create({ id, path: portfolioId }));
            });
            break;
          case 'keyMetrics':
            property.setKeyMetrics(KeyMetrics.create(data as KeyMetricsInput));
            break;
          case 'impactMetrics':
            property.setImpactMetrics(ImpactMetrics.create(data as ImpactMetricsInput));
            break;

          default:
            errors.push(<ValidationErrorType>{
              type: ValidationErrorEnum.UNKNOWN_ERROR,
              field: step,
            });
            break;
        }
      } catch (error: any) {
        console.error(error);
        errors.push(<ValidationErrorType>{
          type: ValidationErrorEnum.UNKNOWN_ERROR,
          field: step,
        });
      }
    }

    property.saveAsAdmin();

    await this.portfolioRepository.updateProperty(property, events);

    return errors;
  }
}
