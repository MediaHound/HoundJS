/* jshint -W098 */

// SDK
import { MHSDK }              from './models/sdk/MHSDK.js';

// Base Models
import { MHObject }           from './models/base/MHObject.js';


// Action Models
import { MHAction }   from './models/action/MHAction.js';
import { MHAdd }      from './models/action/MHAdd.js';
import { MHComment }  from './models/action/MHComment.js';
import { MHCreate }   from './models/action/MHCreate.js';
import { MHLike }     from './models/action/MHLike.js';
import { MHFollow }   from './models/action/MHFollow.js';
import { MHPost }     from './models/action/MHPost.js';

import { MHHashtag }  from './models/hashtag/MHHashtag.js';

// User Models
import { MHUser }         from './models/user/MHUser.js';
import { MHLoginSession } from './models/user/MHLoginSession.js';

import { MHSocial } from './models/social/MHSocial.js';


// Media Models
import { MHMedia }              from './models/media/MHMedia.js';
import { MHAlbum }              from './models/media/MHAlbum.js';
import { MHAlbumSeries }        from './models/media/MHAlbumSeries.js';
import { MHAnthology }          from './models/media/MHAnthology.js';
import { MHBook }               from './models/media/MHBook.js';
import { MHBookSeries }         from './models/media/MHBookSeries.js';
import { MHComicBook }          from './models/media/MHComicBook.js';
import { MHComicBookSeries }    from './models/media/MHComicBookSeries.js';
import { MHGame }               from './models/media/MHGame.js';
import { MHGameSeries }         from './models/media/MHGameSeries.js';
import { MHGraphicNovel }       from './models/media/MHGraphicNovel.js';
import { MHGraphicNovelSeries } from './models/media/MHGraphicNovelSeries.js';
import { MHMovie }              from './models/media/MHMovie.js';
import { MHMovieSeries }        from './models/media/MHMovieSeries.js';
import { MHMusicVideo }         from './models/media/MHMusicVideo.js';
import { MHNovella }            from './models/media/MHNovella.js';
import { MHPeriodical }         from './models/media/MHPeriodical.js';
import { MHPeriodicalSeries }   from './models/media/MHPeriodicalSeries.js';
import { MHShowEpisode }        from './models/media/MHShowEpisode.js';
import { MHShowSeason }         from './models/media/MHShowSeason.js';
import { MHShowSeries }         from './models/media/MHShowSeries.js';
import { MHTrack }               from './models/media/MHTrack.js';
import { MHSpecial }            from './models/media/MHSpecial.js';
import { MHSpecialSeries }      from './models/media/MHSpecialSeries.js';
import { MHTrailer }            from './models/media/MHTrailer.js';

import { MHCollection } from './models/collection/MHCollection.js';

import { MHMetadata } from './models/meta/MHMetadata.js';

import { MHImage } from './models/image/MHImage.js';

import { MHContext } from './models/container/MHContext.js';
import { MHPagedResponse } from './models/container/MHPagedResponse.js';
import { MHRelationalPair }   from './models/container/MHRelationalPair.js';


// Trait Models
import { MHTrait }          from './models/trait/MHTrait.js';
import { MHGenre }          from './models/trait/MHGenre.js';
import { MHSubGenre }       from './models/trait/MHSubGenre.js';
import { MHMood }           from './models/trait/MHMood.js';
import { MHQuality }        from './models/trait/MHQuality.js';
import { MHStyleElement }   from './models/trait/MHStyleElement.js';
import { MHStoryElement }   from './models/trait/MHStoryElement.js';
import { MHMaterialSource } from './models/trait/MHMaterialSource.js';
import { MHTheme }          from './models/trait/MHTheme.js';
import { MHAchievement }    from './models/trait/MHAchievement.js';
import { MHEra }            from './models/trait/MHEra.js';
import { MHAudience }       from './models/trait/MHAudience.js';
import { MHFlag }           from './models/trait/MHFlag.js';
import { MHGraphGenre }     from './models/trait/MHGraphGenre.js';


// Contributor Models
import { MHContributor }                    from './models/contributor/MHContributor.js';
import { MHRealIndividualContributor }      from './models/contributor/MHRealIndividualContributor.js';
import { MHRealGroupContributor }           from './models/contributor/MHRealGroupContributor.js';
import { MHFictionalIndividualContributor } from './models/contributor/MHFictionalIndividualContributor.js';
import { MHFictionalGroupContributor }      from './models/contributor/MHFictionalGroupContributor.js';


// Source Models
import { MHSource }       from './models/source/MHSource.js';
import { MHSubscription } from './models/source/MHSubscription.js';
import { MHSourceFormat } from './models/source/MHSourceFormat.js';
import { MHSourceMethod } from './models/source/MHSourceMethod.js';
import { MHSourceMedium } from './models/source/MHSourceMedium.js';

// Search
import { MHSearch } from './search/MHSearch.js';

// Remove the ability to register more MHObject constructors
delete MHObject.registerConstructor;

export default {
  get MHSDK()            { return MHSDK; },

  get MHObject()         { return MHObject; },
  get MHRelationalPair() { return MHRelationalPair; },

  get MHAction()  { return MHAction; },
  get MHAdd()     { return MHAdd; },
  get MHComment() { return MHComment; },
  get MHCreate()  { return MHCreate; },
  get MHLike()    { return MHLike; },
  get MHFollow()  { return MHFollow; },
  get MHPost()    { return MHPost; },
  get MHHashtag() { return MHHashtag; },

  get MHUser()         { return MHUser; },
  get MHLoginSession() { return MHLoginSession; },

  get MHSocial() { return MHSocial; },

  get MHMedia()              { return MHMedia; },
  get MHAlbum()              { return MHAlbum; },
  get MHAlbumSeries()        { return MHAlbumSeries; },
  get MHAnthology()          { return MHAnthology; },
  get MHBook()               { return MHBook; },
  get MHBookSeries()         { return MHBookSeries; },
  get MHComicBook()          { return MHComicBook; },
  get MHComicBookSeries()    { return MHComicBookSeries; },
  get MHGame()               { return MHGame; },
  get MHGameSeries()         { return MHGameSeries; },
  get MHGraphicNovel()       { return MHGraphicNovel; },
  get MHGraphicNovelSeries() { return MHGraphicNovelSeries; },
  get MHMovie()              { return MHMovie; },
  get MHMovieSeries()        { return MHMovieSeries; },
  get MHMusicVideo()         { return MHMusicVideo; },
  get MHNovella()            { return MHNovella; },
  get MHPeriodical()         { return MHPeriodical; },
  get MHPeriodicalSeries()   { return MHPeriodicalSeries; },
  get MHShowEpisode()        { return MHShowEpisode; },
  get MHShowSeason()         { return MHShowSeason; },
  get MHShowSeries()         { return MHShowSeries; },
  get MHTrack()               { return MHTrack; },
  get MHSpecial()            { return MHSpecial; },
  get MHSpecialSeries()      { return MHSpecialSeries; },
  get MHTrailer()            { return MHTrailer; },

  get MHCollection() { return MHCollection; },

  get MHImage() { return MHImage; },

  get MHContext()  { return MHContext; },
  get MHMetadata() { return MHMetadata; },

  get MHTrait()          { return MHTrait; },
  get MHGenre()          { return MHGenre; },
  get MHSubGenre()       { return MHSubGenre; },
  get MHMood()           { return MHMood; },
  get MHQuality()        { return MHQuality; },
  get MHStyleElement()   { return MHStyleElement; },
  get MHStoryElement()   { return MHStoryElement; },
  get MHMaterialSource() { return MHMaterialSource; },
  get MHTheme()          { return MHTheme; },
  get MHAchievement()    { return MHAchievement; },
  get MHEra()            { return MHEra; },
  get MHAudience()       { return MHAudience; },
  get MHFlag()           { return MHFlag; },
  get MHGraphGenre()     { return MHGraphGenre; },

  get MHContributor()                    { return MHContributor; },
  get MHRealIndividualContributor()      { return MHRealIndividualContributor; },
  get MHRealGroupContributor()           { return MHRealGroupContributor; },
  get MHFictionalIndividualContributor() { return MHFictionalIndividualContributor; },
  get MHFictionalGroupContributor()      { return MHFictionalGroupContributor; },

  get MHSource()       { return MHSource; },
  get MHSubscription() { return MHSubscription; },
  get MHSourceFormat() { return MHSourceFormat; },
  get MHSourceMethod() { return MHSourceMethod; },
  get MHSourceMedium() { return MHSourceMedium; },

  get MHSearch() { return MHSearch; }
};
