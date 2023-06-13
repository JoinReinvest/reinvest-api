import dayjs from 'dayjs';
import { Money } from 'Money/Money';

export enum EVSChartResolution {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
  FIVE_YEARS = 'FIVE_YEARS',
  MAX = 'MAX',
}

export enum FinancialOperationType {
  INVESTMENT = 'INVESTMENT',
  REINVESTMENT = 'REINVESTMENT',
  WITHDRAWAL = 'WITHDRAWAL',
  REVOKED = 'REVOKED',
}

export enum GlobalFinancialOperationType {
  NAV_CHANGED = 'NAV_CHANGED',
}

export type FinancialOperationRecord = {
  createdDate: Date;
  dataJson: {
    numberOfShares: number;
    portfolioId: string;
    unitPrice: number;
  };
  operationType: FinancialOperationType | GlobalFinancialOperationType;
};

export type EVSDataPoint = {
  date: string;
  usd: number;
};

export class EVSDataPointsCalculationService {
  static calculateEVSDataPoints(resolution: EVSChartResolution, financialOperations: FinancialOperationRecord[]): EVSDataPoint[] {
    let startDate = null;
    const lastDate = dayjs().format('YYYY-MM-DD');
    const portfolio = {};
    const mainDataPoints: { [date: string]: number } = {};

    for (const financialOperation of financialOperations) {
      const createdDate = dayjs(financialOperation.createdDate);
      const dateKey = createdDate.format('YYYY-MM-DD');

      const { unitPrice, portfolioId, numberOfShares } = financialOperation.dataJson;
      // @ts-ignore
      const pricePerShare = new Money(parseInt(unitPrice));

      //@ts-ignore
      if (portfolio[portfolioId] === undefined) {
        // @ts-ignore
        portfolio[portfolioId] = {
          numberOfShares: 0,
          pricePerShare: pricePerShare,
        };
      }

      if (startDate === null && financialOperation.operationType === GlobalFinancialOperationType.NAV_CHANGED) {
        continue; // skip first NAV_CHANGED
      }

      if (startDate === null) {
        const theDayBeforeFirstDate = createdDate.subtract(1, 'day').format('YYYY-MM-DD');
        startDate = theDayBeforeFirstDate;
        mainDataPoints[theDayBeforeFirstDate] = 0;
      }

      switch (financialOperation.operationType) {
        case FinancialOperationType.INVESTMENT:
        case FinancialOperationType.REINVESTMENT:
          // @ts-ignore
          portfolio[portfolioId].numberOfShares += numberOfShares;
          // @ts-ignore
          portfolio[portfolioId].pricePerShare = pricePerShare;
          break;
        case GlobalFinancialOperationType.NAV_CHANGED:
          // @ts-ignore
          portfolio[portfolioId].pricePerShare = pricePerShare;
          break;
        default:
          break;
      }

      let EVSValue = Money.zero();

      for (const portfolioId in portfolio) {
        // @ts-ignore
        const { numberOfShares, pricePerShare } = portfolio[portfolioId];
        EVSValue = EVSValue.add(pricePerShare.multiply(numberOfShares));
      }

      mainDataPoints[dateKey] = EVSValue.toUnit();
    }

    if (startDate === null) {
      return [];
    }

    const dataPoints = EVSDataPointsCalculationService.fillDataPoints(startDate!, lastDate, mainDataPoints);

    return EVSDataPointsCalculationService.reduceDataPoints(resolution, dataPoints);
  }

  static fillDataPoints(
    startDate: string,
    lastDate: string,
    mainDataPoints: {
      [date: string]: number;
    },
  ): EVSDataPoint[] {
    const dataPoints: EVSDataPoint[] = [];

    const toDate = dayjs(lastDate);
    let currentDate = dayjs(startDate);
    let currentValue = 0.0;
    do {
      const dateKey = currentDate.format('YYYY-MM-DD');

      if (mainDataPoints[dateKey] !== undefined) {
        // @ts-ignore
        currentValue = mainDataPoints[dateKey];
      }

      dataPoints.push({
        date: dateKey,
        usd: currentValue,
      });

      currentDate = currentDate.add(1, 'day');
    } while (!currentDate.isAfter(toDate));

    return dataPoints;
  }

  static calculateChangeFactor(dataPoints: EVSDataPoint[]): string {
    if (dataPoints.length < 3) {
      return '0%';
    }

    const firstValue = dataPoints[1]!.usd; // first value is always 0
    const lastValue = dataPoints[dataPoints.length - 1]!.usd;

    const changeFactor = Math.round(((((lastValue - firstValue) * 100) / firstValue) * 100) / 100);

    return `${changeFactor}%`;
  }

  private static reduceDataPoints(resolution: EVSChartResolution, dataPoints: EVSDataPoint[]) {
    if (dataPoints.length < 2 || [EVSChartResolution.DAY, EVSChartResolution.MAX].includes(resolution)) {
      return dataPoints;
    }

    const reducedDataPoints: EVSDataPoint[] = [];

    const resolutionToDays = {
      [EVSChartResolution.WEEK]: 7,
      [EVSChartResolution.MONTH]: 30,
      [EVSChartResolution.YEAR]: 365,
      [EVSChartResolution.FIVE_YEARS]: 365 * 5,
    };

    const lastPoint = dataPoints.pop()!;

    for (const index in dataPoints) {
      // @ts-ignore
      if (index % resolutionToDays[resolution] === 0) {
        // @ts-ignore
        reducedDataPoints.push(dataPoints[index]);
      }
    }

    reducedDataPoints.push(lastPoint);

    return reducedDataPoints;
  }
}
