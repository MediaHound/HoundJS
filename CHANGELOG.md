## Master

* No changes in master

## 0.6.0-beta7 (2016-04-25)

* Context supports fixed position
* MHCollection.fetchContent() supports filters

## 0.6.0-beta6 (2016-04-22)

* New top level silo fetch endpoint
* Add `liking` to MHSocial

## 0.6.0-beta5 (2016-04-21)

* MHObjects are now merged properly when new data with nulls arrives
* Form encoded POST requests are sent with correct Content-Type
* Password Grant Flow supported
* Register new users for Password Grant Flow

## 0.6.0-beta4 (2016-04-07)

* Remove MHGraphTrait

## 0.6.0-beta3 (2016-04-07)

* New trait categories

## 0.6.0-beta2 (2016-04-06)

* Accept filters on fetchContent() of MHTrait

## 0.6.0-beta1 (2016-04-06)

* Bucket support for suggested silos and trait composition

## 0.5.17 (2016-04-01)

* `subType` field supported on MHMetadata

## 0.5.16 (2016-03-31)

* User social supported
* Fix bug in merging of MHObjects

## 0.5.15 (2016-03-14)

* Collections support appendContent() and prependContent()

## 0.5.14 (2016-03-11)

* Fix bugs in removing from a collection

## 0.5.13 (2016-03-11)

* Improved collection support for api v12

## 0.5.12 (2016-03-09)

* fetchLiking() added to MHUser.

## 0.5.11 (2016-02-25)

* browser builds should not include unnecesarry browser dependencies.

## 0.5.10 (2016-02-24)

* loginDialogURLWithRedirectURL takes an optional scope parameter

## 0.5.9 (2016-02-18)

* Expose houndRequest

## 0.5.8 (2016-02-1)

* Dist builds of hound.js include the babel polyfill

## 0.5.7 (2016-01-28)

* Allow MHSDK configuration directly with an access token

## 0.5.6 (2016-01-25)

* `fetchGraphGenres()` on media

## 0.5.5 (2016-01-19)

* dist build is wrapped as UMD

## 0.5.4 (2016-01-19)

* Generate a browserified & minified build into `dist/`.

## 0.5.3 (2016-01-18)

* Fix MHMetadata instances from using Object.assign to using object ... syntax.

## 0.5.2 (2016-01-17)

* Rerelease 

## 0.5.1 (2016-01-17)

* Fix require() call on Linux for MHMetadata

## 0.5.0 (2016-01-15)

* Use Babel for ES2015 transpilation
* Does not generate a single hound.js file anymore

## 0.4.0 (2016-01-15)

* API 1.2 support
* 1.2 OAuth support

## 0.3.3 (2015-12-1)

* fetchRelatedTo() supports an array of mhids

## 0.3.2 (2015-11-30)

* Base Traits for objects

## 0.3.0 (2015-10-23)

* Initial public release
