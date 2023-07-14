import { UUID } from 'HKEKTypes/Generics';
import { PropertyRepository } from 'Portfolio/Adapter/Database/Repository/PropertyRepository';
import { ImpactMetrics, KeyMetrics, PropertyAddress, PropertyLocation } from 'Portfolio/Domain/types';
import { ValidationErrorEnum, ValidationErrorType } from 'Portfolio/Domain/Validation';
import { DomainEvent } from 'SimpleAggregator/Types';

export type UpdatePropertyInput = {
  POIs?: {
    description: string;
    image: { id: string };
    name: string;
  }[];
  address?: PropertyAddress;
  gallery?: { id: string }[];
  image?: { id: string };
  impactMetrics?: ImpactMetrics;
  keyMetrics?: KeyMetrics;
  location?: PropertyLocation;
  name?: string;
};

export class UpdateProperty {
  private portfolioRepository: PropertyRepository;

  constructor(portfolioRepository: PropertyRepository) {
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
            property.setNameAsAdmin(data as string);
            break;
          case 'address':
            property.setAddressAsAdmin(data as PropertyAddress);
            break;
          case 'location':
            property.setLocationAsAdmin(data as PropertyLocation);
            break;
          case 'POIs':
            const pois = data as UpdatePropertyInput['POIs'];
            pois!.forEach(({ image: { id: imageId }, description, name }) => {
              property.addPOIAsAdmin({ description, name, image: imageId, path: portfolioId });
            });
            break;
          case 'image':
            const id = (<UpdatePropertyInput['image']>data)!.id;
            const event = property.replaceImageAsAdmin({ id, path: portfolioId });

            if (event) {
              events.push(event);
            }

            break;
          case 'gallery':
            const ids = <UpdatePropertyInput['gallery']>data;
            ids!.forEach(({ id }) => {
              property.addGalleryImageAsAdmin({ id, path: portfolioId });
            });
            break;
          case 'keyMetrics':
            property.setKeyMetricsAsAdmin(data as KeyMetrics);
            break;
          case 'impactMetrics':
            property.setImpactMetricsAsAdmin(data as ImpactMetrics);
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

    await this.portfolioRepository.updateProperty(property, events);

    return errors;
  }
}
