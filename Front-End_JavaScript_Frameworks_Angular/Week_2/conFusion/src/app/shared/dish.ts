import { Comment } from "./comment";

export class Dish {

    comments!: Comment[];
    id!: string;
    name!: string;
    image!: string;
    category!: string;
    featured!: boolean;
    label!: string;
    price!: string;
    description!: string;
} 