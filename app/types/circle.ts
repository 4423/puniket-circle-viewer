export interface Circle {
  id: number;
  circle: string;
  name: string;
  place: string;
  links: {
    hp: string | undefined;
    twitter: string | undefined;
    pixiv: string | undefined;
  };
  event: string;
}
