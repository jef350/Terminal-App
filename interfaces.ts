export interface airsoft {
    id: number;
    name: string;
    description: string;
    fps: number;
    fullauto: boolean; 
    releasedate: string;
    imageURL: string;
    type: string;
    playtypes: string[];
    manufacturer: number;
}

export interface manufacturer{
    id: number,
    name: string,
    country: string,
    website: string
}