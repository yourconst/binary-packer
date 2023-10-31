import { Helpers } from "../utils2";

// export enum SomeEnum {
//     'a' = 'a',
//     'b' = 'b',
//     'c' = 'c',
// }

// export const pbSomeEnum = Object.fromEntries(Object.values(SomeEnum).map((v, i) => ([v, i])));

export const SomeEnum = {
    'a': 1,
    'b': 2,
    'c': 3,
};

export const randSomeEnum = () => [SomeEnum.a, SomeEnum.b, SomeEnum.c][Helpers.Random.uint(3)];
