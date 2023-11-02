# ebinary

## Description
Statically typed data binary encoding library.
<br />
Dependency free.
<br />
Good types supporting.

<br />

## Installation

```bash
npm i ebinary
```

## Usage

```typescript
import { Encoder, Type } from 'ebinary';

const encoder = new Encoder(Type.Array(Type.Struct({
    id: Type.UInt32(),
    count: Type.UInt16(),
    enabled: Type.Nullable(Type.Bool()),
})));

const buffer = encoder.encode([
    { id: 1, count: 123, enabled: null },
    { id: 2, count: 756, enabled: true },
    { id: 3, count: 435, enabled: false },
]);

const value = encoder.decode(buffer);
```

<br />

<!-- ## Motivation
This library is ~2 times faster than `protobufjs` library data encoding (for different from `string` data types). Decoding has the same performance.
<br />
Also it supports `ascii` string encoding (it's faster and smaller than `utf8`) and any top-level type. -->

<br />

## Supported types

| Name | Byte length | JS type | Description |
|---|---|---|---|
| `Struct<T>` | ... | `{...T}` | - |
| `OneOf<T>` | [1,2]+... | `{$key:T[$key]}` | Only one of properties provided |
| `Array<T,L>` | sizeof(L)+... | `T[]` | `L` - typeof `length` |
| `String<L>` | sizeof(L)+... | `string` | utf8 / ascii. `L` - typeof `length` |
| `Buffer<L>` | sizeof(L)+... | `Uint8Array` | `L` - typeof `length` |
| `Enum<T>` | [1,2] | `T` | - |
| `Const<T>` | 0 | `T` | Not encodes into buffer |
| `Nullable<T>` | 1+... | `T\|null` | `undefined` encodes as `null` |
| `Aligned<T,A>` | [0,7]+... | `T` | Add trailing empty bytes for desired bytes align (`A`) (eg. for `C` struct compatibility) |
| `UVarInt32` | [1, 5] | `number` | variable length unsigned int |
| `VarInt32` | [1, 5] | `number` | variable length signed int |
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
