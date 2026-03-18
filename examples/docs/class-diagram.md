# Class Diagram

Test copy button and zoom controls on class diagrams.

## Inheritance

```mermaid
classDiagram
  class Animal {
    +String name
    +int age
    +speak() String
  }
  class Dog {
    +String breed
    +fetch() void
    +speak() String
  }
  class Cat {
    +bool indoor
    +purr() void
    +speak() String
  }
  Animal <|-- Dog
  Animal <|-- Cat
```

**Verify:** Click the **copy icon** (top-right) — the Mermaid source should be copied to your clipboard.

## Interface pattern

```mermaid
classDiagram
  class Logger {
    <<interface>>
    +log(msg: string) void
    +error(msg: string) void
  }
  class ConsoleLogger {
    +log(msg: string) void
    +error(msg: string) void
  }
  class FileLogger {
    -filePath: string
    +log(msg: string) void
    +error(msg: string) void
  }
  Logger <|.. ConsoleLogger
  Logger <|.. FileLogger
```
