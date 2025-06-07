# Change Logs:

---

## [5.0.1](https://github.com/ansulagrawal/react-big-schedule/compare/5.0.0...5.0.1)

**Released on:** 2025-06-07
- **Hot Fixes:** Fixed the `dist` entry point to correctly output `bundle.js`.
  [#216](https://github.com/ansulagrawal/react-big-schedule/pull/216) by [@gleerman](https://github.com/gleerman)

---

## [5.0.0](https://github.com/ansulagrawal/react-big-schedule/compare/4.5.1...5.0.0)

**Released on:** 2025-06-05

- **Enhancement:** Improve Scheduler Responsiveness with Dynamic Height and Header Awareness.
  [#213](https://github.com/your-repo-link/pull/213) by [@rwilson504](https://github.com/rwilson504)
- **Refactor:** Converted `src/components/index.js` from a class to a functional component.
  [#211](https://github.com/your-repo-link/pull/211) by [@EmmanuelIdeho](https://github.com/EmmanuelIdeho)
- **Chore(deps-dev):** Bump `copy-webpack-plugin` from `12.0.2` to `13.0.0`.
  [#210](https://github.com/your-repo-link/pull/210) by  [@dependabot](https://github.com/dependabot)
- **Chore(deps):** Bump `@ant-design/icons` from `5.6.1` to `6.0.0`.
  [#209](https://github.com/your-repo-link/pull/209) by  [@dependabot](https://github.com/dependabot)
- **Chore(deps-dev):** Bump `babel-loader` from `9.2.1` to `10.0.0`.
  [#208](https://github.com/your-repo-link/pull/208) by  [@dependabot](https://github.com/dependabot)

---

## [4.5.1](https://github.com/ansulagrawal/react-big-schedule/compare/4.5.0...4.5.1)

**Released on**: 2025-04-27

- Rebuilt and redeployed version without code changes. [#207](https://github.com/ansulagrawal/react-big-schedule/pull/207) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [4.5.0](https://github.com/ansulagrawal/react-big-schedule/compare/4.4.5...4.5.0)

**Released on**: 2025-04-27

- **Chore(deps)**: Bumped `react-router-dom` from `6.28.0` to `7.0.1`. [#186](https://github.com/ansulagrawal/react-big-schedule/pull/186) by [@dependabot](https://github.com/dependabot)
- **Style**: Encapsulated CSS styles within the `.react-big-schedule` namespace and optimized the stylesheet structure to prevent conflicts with external styles. [#204](https://github.com/ansulagrawal/react-big-schedule/pull/204) by [@lpzDeimar](https://github.com/lpzDeimar)
- **Docs**: Updated repository links to reflect new ownership and ensure consistency across documentation files. [#206](https://github.com/ansulagrawal/react-big-schedule/pull/206) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [4.4.5](https://github.com/ansulagrawal/react-big-schedule/compare/4.4.4...4.4.5)

**Released on**: 2024-11-19

- Fixed library issue with `create-react-app` and `webpack` configuration. [#182](https://github.com/ansulagrawal/react-big-schedule/pull/182) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [4.4.4](https://github.com/ansulagrawal/react-big-schedule/compare/4.4.3...4.4.4)

**Released on**: 2024-11-13

- Fixed `dayjs` locale issue. [#179](https://github.com/ansulagrawal/react-big-schedule/pull/179) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [4.4.3](https://github.com/ansulagrawal/react-big-schedule/compare/4.4.2...4.4.3)

**Released on**: 2024-10-28

- Changed the build type from `common.js` to `module.js`. [#174](https://github.com/ansulagrawal/react-big-schedule/pull/174) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [4.4.2](https://github.com/ansulagrawal/react-big-schedule/compare/4.4.1...4.4.2)

**Released on**: 2024-10-25

- Fixed typo of `dragtype` to `dragType`. [#171](https://github.com/ansulagrawal/react-big-schedule/pull/171) by [@ansulagrawal](https://github.com/ansulagrawal)
- Fixed `End Drag` bug [#167](https://github.com/ansulagrawal/react-big-schedule/issues/167). [#171](https://github.com/ansulagrawal/react-big-schedule/pull/171) by [@ansulagrawal](https://github.com/ansulagrawal), thanks to [@Navid-gh](https://github.com/Navid-gh)

---

## [4.4.1](https://github.com/ansulagrawal/react-big-schedule/compare/4.4.0...4.4.1)

**Released on**: 2024-10-06

- Fixed `CHANGELOG.MD` file.
- Removed `default` keyword from Scheduler Class in `typing/index.d.ts` file of TypeScript. [#154](https://github.com/ansulagrawal/react-big-schedule/pull/154) by [@ansulagrawal](https://github.com/ansulagrawal)
- Updated `utcOffset` method calls to pass `new Date()` instead of `new Date().utcOffset`. [#155](https://github.com/ansulagrawal/react-big-schedule/pull/155) by [@ansulagrawal](https://github.com/ansulagrawal)
- Updated `node_modules` version.

---

## [4.4.0](https://github.com/ansulagrawal/react-big-schedule/compare/4.3.3...4.4.0)

**Released on**: 2024-02-21

- Updated `node_modules` version. [#132](https://github.com/ansulagrawal/react-big-schedule/pull/132) by [@ansulagrawal](https://github.com/ansulagrawal)
- Fixed issue with displaying hour headers properly in `ViewType.Data`. [#131](https://github.com/ansulagrawal/react-big-schedule/pull/131) by [@ansulagrawal](https://github.com/ansulagrawal)
- Bumped `webpack-dev-server` from `4.15.1` to `5.0.2`. [#130](https://github.com/ansulagrawal/react-big-schedule/pull/130) by [@dependabot](https://github.com/dependabot)

---

## [4.3.3](https://github.com/ansulagrawal/react-big-schedule/compare/4.3.2...4.3.3)

**Released on**: 2023-12-16

- Updated `node_modules` version.
- Fixed issue displaying `[object Object]` in the title of resources. [#114](https://github.com/ansulagrawal/react-big-schedule/issues/114)

---

## [4.3.2](https://github.com/ansulagrawal/react-big-schedule/compare/4.3.1...4.3.2)

**Released on**: 2023-11-06

- Updated `node_modules` version. [#111](https://github.com/ansulagrawal/react-big-schedule/pull/111) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [4.3.1](https://github.com/ansulagrawal/react-big-schedule/compare/4.3.0...4.3.1)

**Released on**: 2023-10-16

- Updated build code by adding typing file `index.d.ts`. [#110](https://github.com/ansulagrawal/react-big-schedule/pull/110) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [4.3.0](https://github.com/ansulagrawal/react-big-schedule/compare/4.2.5...4.3.0)

**Released on**: 2023-10-16

- **Chore(deps)**: Bumped `antd` from `5.7.0` to `5.7.1`. [#81](https://github.com/ansulagrawal/react-big-schedule/pull/81) by [@dependabot](https://github.com/dependabot)
- **Chore(deps)**: Bumped `antd` from `5.7.1` to `5.7.2`. [#82](https://github.com/ansulagrawal/react-big-schedule/pull/82) by [@dependabot](https://github.com/dependabot)
- Created `CONTRIBUTING.md`. [#83](https://github.com/ansulagrawal/react-big-schedule/pull/83) by [@ansulagrawal](https://github.com/ansulagrawal)
- **Chore(deps)**: Bumped `antd` from `5.7.2` to `5.7.3`. [#84](https://github.com/ansulagrawal/react-big-schedule/pull/84) by [@dependabot](https://github.com/dependabot)
- Refactored `headerview` and fixed errors. [#88](https://github.com/ansulagrawal/react-big-schedule/pull/88) by [@DamyanBG](https://github.com/DamyanBG)
- Removed unnecessary files. [#90](https://github.com/ansulagrawal/react-big-schedule/pull/90) by [@ansulagrawal](https://github.com/ansulagrawal)
- Applied fixes from CodeFactor. [#89](https://github.com/ansulagrawal/react-big-schedule/pull/89) by [@ansulagrawal](https://github.com/ansulagrawal)
- Added CodeFactor Code Quality Badge. [#100](https://github.com/ansulagrawal/react-big-schedule/pull/100) by [@ansulagrawal](https://github.com/ansulagrawal)
- Added typing file for TypeScript users. [#99](https://github.com/ansulagrawal/react-big-schedule/pull/99) by [@ansulagrawal](https://github.com/ansulagrawal)
- Configured ESLint. [#93](https://github.com/ansulagrawal/react-big-schedule/pull/93) by [@ansulagrawal](https://github.com/ansulagrawal)
- Fixed ESLint issues and updated package versions. [#104](https://github.com/ansulagrawal/react-big-schedule/pull/104) by [@ansulagrawal](https://github.com/ansulagrawal)
- Applied CodeFactor fixes. [#105](https://github.com/ansulagrawal/react-big-schedule/pull/105) by [@ansulagrawal](https://github.com/ansulagrawal)
- Fixed ESLint errors. [#108](https://github.com/ansulagrawal/react-big-schedule/pull/108) by [@ansulagrawal](https://github.com/ansulagrawal)
- Updated changelog. [#109](https://github.com/ansulagrawal/react-big-schedule/pull/109) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [4.2.5](https://github.com/ansulagrawal/react-big-schedule/compare/4.2.4...4.2.5)

**Released on**: 2023-08-01

- Fixed CSS bug that caused issues with the header position. [#80](https://github.com/ansulagrawal/react-big-schedule/pull/80) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [4.2.4](https://github.com/ansulagrawal/react-big-schedule/compare/4.2.3...4.2.4)

**Released on**: 2023-07-20

- Fixed bug where `onSelectEvent` was not firing. [#74](https://github.com/ansulagrawal/react-big-schedule/pull/74) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [4.2.3](https://github.com/ansulagrawal/react-big-schedule/compare/4.2.2...4.2.3)

**Released on**: 2023-06-21

- Fixed issue with event display in resource view. [#69](https://github.com/ansulagrawal/react-big-schedule/pull/69) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [4.2.2](https://github.com/ansulagrawal/react-big-schedule/compare/4.2.1...4.2.2)

**Released on**: 2023-06-07

- Fixed bug that caused event titles to be cut off. [#65](https://github.com/ansulagrawal/react-big-schedule/pull/65) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [4.2.1](https://github.com/ansulagrawal/react-big-schedule/compare/4.2.0...4.2.1)

**Released on**: 2023-05-18

- Fixed bug that prevented the display of the resource name in the event card. [#62](https://github.com/ansulagrawal/react-big-schedule/pull/62) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [4.2.0](https://github.com/ansulagrawal/react-big-schedule/compare/4.1.0...4.2.0)

**Released on**: 2023-05-01

- Fixed display issue in the resource view. [#55](https://github.com/ansulagrawal/react-big-schedule/pull/55) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [4.1.0](https://github.com/ansulagrawal/react-big-schedule/compare/4.0.0...4.1.0)

**Released on**: 2023-04-17

- Fixed bug related to event title truncation. [#53](https://github.com/ansulagrawal/react-big-schedule/pull/53) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [4.0.0](https://github.com/ansulagrawal/react-big-schedule/compare/3.0.0...4.0.0)

**Released on**: 2023-04-04

- Updated to support React 18 and latest API. [#46](https://github.com/ansulagrawal/react-big-schedule/pull/46) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [3.0.0](https://github.com/ansulagrawal/react-big-schedule/compare/2.0.0...3.0.0)

**Released on**: 2023-03-01

- Migrated to TypeScript. [#40](https://github.com/ansulagrawal/react-big-schedule/pull/40) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [2.0.0](https://github.com/ansulagrawal/react-big-schedule/compare/1.0.0...2.0.0)

**Released on**: 2023-02-07

- Major release with breaking changes.
- Improved component structure and API. [#20](https://github.com/ansulagrawal/react-big-schedule/pull/20) by [@ansulagrawal](https://github.com/ansulagrawal)

---

## [1.0.0](https://github.com/ansulagrawal/react-big-schedule/releases/tag/1.0.0)

**Released on**: 2023-01-15

- Initial release. [#10](https://github.com/ansulagrawal/react-big-schedule/pull/10) by [@ansulagrawal](https://github.com/ansulagrawal)
