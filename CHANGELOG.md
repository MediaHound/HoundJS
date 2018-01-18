## Master

* No changes in master

## 0.7.7 (2018-01-18)

* relate() takes a distribution parameter

## 0.7.6 (2018-01-04)

* Expose sdk.details.setOrigin()

## 0.7.5 (2018-01-04)

* explore() and silo() takes a method for either GET or POST

## 0.7.4 (2018-01-04)

* relate() takes a method for either GET or POST

## 0.7.3 (2018-01-02)

* Expose sdk.details.setAccessToken()

## 0.7.2 (2017-12-21)

* Expose relate's config parameter

## 0.7.1 (2017-12-05)

* houndRequest can take an accessToken override

## 0.7.0 (2017-10-19)

* Upgrade to MediaHound API 1.3

## 0.6.22 (2017-6-14)

* Support new model for Paged Response as components

## 0.6.21 (2016-10-19)

* Supports using houndjs in a WebWorker

## 0.6.20 (2016-09-28)

* Dates are not localized to the current timezone anymore

## 0.6.19 (2016-09-02)

* MHLoginSession.loginWithAccessToken() forcibly fetches the user

## 0.6.18 (2016-09-01)

* Search now supports fetchSegmentedResultsForSearchTerm

## 0.6.17 (2016-08-29)

* MHObjects now have the MHSocialMetrics field

## 0.6.16 (2016-08-25)

* All collection edit methods take an optional allowDuplicates

## 0.6.15 (2016-08-18)

* fetchTopResults() added to MHSearch to get top movies

## 0.6.14 (2016-08-17)

* Expose keySuitabilities from MHMedia

## 0.6.13 (2016-08-17)

* Fix lookups into mhidLRU so they gurantee success

## 0.6.12 (2016-08-03)

* MHTrait.fetchContent supports sort

## 0.6.11 (2016-08-02)

* MHContributor.fetchMedia supports filters and sort

## 0.6.10 (2016-07-21)

* MHUser.setPassword throws errors correctly

## 0.6.9 (2016-07-20)

* Support firstName and lastName on MHUserMetadata

## 0.6.8 (2016-07-07)

* Support basecontributor for search

## 0.6.7 (2016-07-01)

* Promotion support for Silos and Related

## 0.6.6 (2016-06-28)

* Support launchInfo and social on MHContext

## 0.6.5 (2016-06-21)

* Support "metadata" on MHContext

## 0.6.4 (2016-06-03)

* keyTraits for all MHMedia

## 0.6.3 (2016-06-02)

* Cached responses cache based on the params

## 0.6.2 (2016-05-20)

* MHObject fetches include the view and pageSize when caching responses

## 0.6.1 (2016-05-06)

* MHCollection.removeByMhid()

## 0.6.0 (2016-05-05)

* Released 0.6.0

## 0.6.0-beta9 (2016-05-04)

* MHSilo.fetchSuggestedSillos() supports a siloPageSize param

## 0.6.0-beta8 (2016-05-02)

* MHCollection supports remove all

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
