# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/).


## [Unreleased]
### Added
### Change
- Changed whole project to use typescript
- Added integration tests to test api commands for compiling
- added endpoint for compiling using cdv
- updated header to be greyed out and have a spinner when calling async cdv endpoint
- return CLVM bytecode with api response
### Fixed


## [0.0.2] - 2025-06-17
### Added
- Added a history drop down to the terminal component.
- updated docker file to install 'chia-dev-tools' to get use of cdv

### Changed
- Changed wrapping of editor and parameters components so that they wrap when there is not enough space when on smaller screens.

### Fixed

-------------

## [0.0.1] - 2025-06-05
### Added
- Created a proof of concept ui of creating classic chialisp programs using chia-wallet-sdk
- Created alpha release of simulator ui
- Published docker image for the simulator ui - https://hub.docker.com/repository/docker/kevinonfrontend/simulator-ui/general

### Changed

### Fixed
