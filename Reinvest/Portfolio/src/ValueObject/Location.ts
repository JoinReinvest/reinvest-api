export type LocationInput = {
  lat: string;
  lng: string;
};
export class Location {
  private lat: string;
  private lng: string;

  constructor(lat: string, lng: string) {
    this.lat = lat;
    this.lng = lng;
  }

  static create(data: LocationInput): Location {
    const { lat, lng } = data;

    return new Location(lat, lng);
  }

  toObject() {
    return {
      lat: this.lat,
      lng: this.lng,
    };
  }
}
