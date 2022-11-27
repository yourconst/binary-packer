# binary-packer

## Description
Statically typed data encoding library.

<br />

## Installation

```bash
npm i binary-packer
```

## Usage

```typescript
import { BinaryPacker, BinarySchemas as BS } from 'binary-packer';

const packer = new BinaryPacker(BS.Array(BS.Struct({
    id: BS.UInt32(),
    count: BS.UInt16(),
    enabled: BS.Nullable(BS.Bool()),
})));

const encodedBuffer = packer.encode([
    { id: 1, count: 123, enabled: null },
    { id: 2, count: 756, enabled: true },
    { id: 3, count: 435, enabled: false },
]);

const decodedValues = packer.decode(encodedBuffer);
```

<br />

## Motivation
This library is ~2 times faster than `protobufjs` library data encoding (for different from `string` data types). Decoding has the same performance.
Also it supports `ascii` string encoding (it's faster and smaller than `utf8`) and any top-level type.

<br />

## Supported types

| Name | Byte length | JS type | Description |
|---|---|---|---|
| `Struct<T extends {}>` | sum(sizeof(T[key])) | `T` | - |
| `Array<T, L>` | sizeof(L) + sum(sizeof(T[i])) | `T[]` | `L` - typeof `length` |
| `String<L>` | sizeof(L) + ... | `string` | utf8 / ascii. `L` - typeof `length` |
| `Enum<T>` | [1, 2] | `T` | - |
| `Const<T>` | 0 | `T` | Not encodes into buffer |
| `Nullable<T>` | 1 + sizeof(T) | `T \| null` | - |
| `Aligned<T, A extends number>` | aligned(sizeof(T), A) | `T` | Add trailing empty bytes for desired bytes align (`A`) (eg. for `C` struct compatibility) |
| `LEB128` | [1, 5] | `number` | variable length unsigned int |
| `SignedLEB128` | [1, 5] | `number` | variable length signed int |
| `Bool` | 1 | `boolean` | - |
| `Float64` | 8 | `number` | little / big endian |
| `Float32` | 4 | `number` | little / big endian |
| `UInt64` | 8 | `bigint` | little / big endian |
| `Int64` | 8 | `bigint` | little / big endian |
| `UInt32` | 4 | `number` | little / big endian |
| `Int32` | 4 | `number` | little / big endian |
| `UInt16` | 2 | `number` | little / big endian |
| `Int16` | 2 | `number` | little / big endian |
| `UInt8` | 1 | `number` | - |
| `Int8` | 1 | `number` | - |
