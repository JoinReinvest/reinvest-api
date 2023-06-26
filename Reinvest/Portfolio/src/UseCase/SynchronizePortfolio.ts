import { UUID } from 'HKEKTypes/Generics';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { DealpathAdapter } from 'Portfolio/Adapter/Dealpath/DealpathAdapter';
import { Property, PropertyData, PropertyStatus } from 'Portfolio/Domain/Property';
import { Address, AddressInput } from 'Portfolio/ValueObject/Address';
import { Location, LocationInput } from 'Portfolio/ValueObject/Location';

import { ValidationErrorEnum, ValidationErrorType } from '../Domain/Validation';

class SynchronizePortfolio {
  private portfolioRepository: PortfolioRepository;
  private dealpathAdapter: DealpathAdapter;

  constructor(portfolioRepository: PortfolioRepository, dealpathAdapter: DealpathAdapter) {
    this.portfolioRepository = portfolioRepository;
    this.dealpathAdapter = dealpathAdapter;
  }

  static getClassName = () => 'SynchronizePortfolio';

  async execute(portfolioId: UUID) {
    const errors = [];
    const propertiesFromDealpath = await this.dealpathAdapter.getProperties();

    if (!propertiesFromDealpath || propertiesFromDealpath?.properties.data.length === 0) {
      return false;
    }

    for (const property of propertiesFromDealpath.properties.data) {
      const propertyWithGivenId = await this.portfolioRepository.getById(property.id);

      if (propertyWithGivenId) {
        const inputKeys = Object.keys(property) as (keyof PropertyData)[];

        for (const step of inputKeys) {
          try {
            const data = property[step];

            if (data === null) {
              errors.push(<ValidationErrorType>{
                type: ValidationErrorEnum.EMPTY_VALUE,
                field: step,
              });
              continue;
            }

            switch (step) {
              case 'name':
                propertyWithGivenId.setName(data as string);
                break;
              case 'address':
                propertyWithGivenId.setAddress(Address.create(data as AddressInput));
                break;
              case 'location':
                propertyWithGivenId.setLocation(Location.create(data as LocationInput));
                break;
              default:
                errors.push(<ValidationErrorType>{
                  type: ValidationErrorEnum.UNKNOWN_ERROR,
                  field: step,
                });
                break;
            }
          } catch (error: any) {
            errors.push(<ValidationErrorType>{
              type: ValidationErrorEnum.UNKNOWN_ERROR,
              field: step,
            });
          }
        }

        await this.portfolioRepository.updateProperty(propertyWithGivenId);
      } else {
        const { id, address, name, location } = property;

        const dealpathJson = {
          id,
          name,
          address,
          location,
        };

        const adminJson = {};

        const dataJson = {
          ...dealpathJson,
          ...adminJson,
        };
        const newProperty = Property.create({ id, portfolioId, status: PropertyStatus.ACTIVE, lastUpdate: new Date(), dataJson, dealpathJson, adminJson });
        await this.portfolioRepository.createProperty(newProperty);
      }
    }

    const propertiesInDb = await this.portfolioRepository.getAll(portfolioId);

    if (propertiesInDb && propertiesInDb.length) {
      const propertiesToArchive = propertiesInDb.filter(property => {
        return !propertiesFromDealpath.properties.data.find(el => el.id === property.getId());
      });

      for (const property of propertiesToArchive) {
        property.archive();

        await this.portfolioRepository.updateProperty(property);
      }
    }

    return errors;
  }
}

export default SynchronizePortfolio;
