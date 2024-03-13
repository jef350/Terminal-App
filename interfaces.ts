export interface airsoft{
    id: number,
    name: string,
    description: string,
    fps: number,
    fullAuto: boolean,
    releasedate: string,
    imageURL: string,
    type: string,
    hobbies: string[],
    manufacturer: number;
}

export interface manufacturer{
    id: number,
    name: string,
    country: string,
    website: string
}