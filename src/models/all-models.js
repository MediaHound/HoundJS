/**
 * Created by Ryan Bogle on 9/19/14.
 * Maintained by Steve Belovarich.
 */

/*
  TODO
    'setup-model.js',
    'internal/MHCache.js',
    'cleanup-model.js'
 */

// Base Models
import { MHObject }           from './base/MHObject';
import { MHEmbeddedObject }   from './base/MHEmbeddedObject';
import { MHEmbeddedRelation } from './base/MHEmbeddedRelation';
import { MHRelationalPair }   from './base/MHRelationalPair';


// Action Models
import { MHAction }   from './action/MHAction';
import { MHAdd }      from './action/MHAdd';
import { MHComment }  from './action/MHComment';
import { MHCreate }   from './action/MHCreate';
import { MHLike }     from './action/MHLike';
import { MHFollow }   from './action/MHFollow';
import { MHPost }     from './action/MHPost';
import { MHHashtag }  from './action/MHHashtag';

// User Models
import { MHUser }         from './user/MHUser';
import { MHLoginSession } from './user/MHLoginSession';

import { MHSocial } from './social/MHSocial';


// Media Models
import { MHMedia }              from './media/MHMedia';
import { MHAlbum }              from './media/MHAlbum';
import { MHAlbumSeries }        from './media/MHAlbumSeries';
import { MHAnthology }          from './media/MHAnthology';
import { MHBook }               from './media/MHBook';
import { MHBookSeries }         from './media/MHBookSeries';
import { MHComicBook }          from './media/MHComicBook';
import { MHComicBookSeries }    from './media/MHComicBookSeries';
import { MHGame }               from './media/MHGame';
import { MHGameSeries }         from './media/MHGameSeries';
import { MHGraphicNovel }       from './media/MHGraphicNovel';
import { MHGraphicNovelSeries } from './media/MHGraphicNovelSeries';
import { MHMovie }              from './media/MHMovie';
import { MHMovieSeries }        from './media/MHMovieSeries';
import { MHMusicVideo }         from './media/MHMusicVideo';
import { MHNovella }            from './media/MHNovella';
import { MHPeriodical }         from './media/MHPeriodical';
import { MHPeriodicalSeries }   from './media/MHPeriodicalSeries';
import { MHShowEpisode }        from './media/MHShowEpisode';
import { MHShowSeason }         from './media/MHShowSeason';
import { MHShowSeries }         from './media/MHShowSeries';
import { MHSong }               from './media/MHSong';
import { MHSpecial }            from './media/MHSpecial';
import { MHSpecialSeries }      from './media/MHSpecialSeries';
import { MHTrailer }            from './media/MHTrailer';

import { MHCollection } from './collection/MHCollection';

import { MHContext } from './meta/MHContext';
import { MHMetaData } from './meta/MHMetaData';
import { MHImage } from './image/MHImage';


// Trait Models
import { MHTrait }          from './trait/MHTrait';
import { MHTraitGroup }     from './trait/MHTraitGroup';
import { MHGenre }          from './trait/MHGenre';
import { MHSubGenre }       from './trait/MHSubGenre';
import { MHMood }           from './trait/MHMood';
import { MHQuality }        from './trait/MHQuality';
import { MHStyleElement }   from './trait/MHStyleElement';
import { MHStoryElement }   from './trait/MHStoryElement';
import { MHMaterialSource } from './trait/MHMaterialSource';
import { MHTheme }          from './trait/MHTheme';
import { MHAchievements }   from './trait/MHAchievements';
import { MHEra }            from './trait/MHEra';
import { MHAudience }       from './trait/MHAudience';
import { MHFlag }           from './trait/MHFlag';
import { MHGraphGenre }     from './trait/MHGraphGenre';


// Contributor Models
import { MHContributor }                    from './contributor/MHContributor';
import { MHRealIndividualContributor }      from './contributor/MHRealIndividualContributor';
import { MHRealGroupContributor }           from './contributor/MHRealGroupContributor';
import { MHFictionalIndividualContributor } from './contributor/MHFictionalIndividualContributor';
import { MHFictionalGroupContributor }      from './contributor/MHFictionalGroupContributor';


// Source Models
import { MHSource } from './source/MHSource';
import { MHSubscription } from './source/MHSubscription';
import { MHSourceFormat } from './source/MHSourceFormat';
import { MHSourceMethod } from './source/MHSourceMethod';
import { MHSourceMedium } from './source/MHSourceMedium';
import { MHSourceModel }  from './source/MHSourceModel';

delete MHObject.registerConstructor;

export var models = {
  get MHObject()          { return MHObject; },
  get MHEmbeddedObject()  { return MHEmbeddedObject; },
  get MHEmbeddedRelation(){ return MHEmbeddedRelation; },
  get MHRelationalPair()  { return MHRelationalPair; },

  get MHAction()  { return MHAction; },
  get MHAdd()     { return MHAdd; },
  get MHComment() { return MHComment; },
  get MHCreate()  { return MHCreate; },
  get MHLike()    { return MHLike; },
  get MHFollow()  { return MHFollow; },
  get MHPost()    { return MHPost; },
  get MHHashtag() { return MHHashtag; },

  get MHUser()        { return MHUser; },
  get MHLoginSession(){ return MHLoginSession; },

  get MHSocial()      { return MHSocial; },

  get MHMedia()             { return MHMedia; },
  get MHAlbum()             { return MHAlbum; },
  get MHAlbumSeries()       { return MHAlbumSeries; },
  get MHAnthology()         { return MHAnthology; },
  get MHBook()              { return MHBook; },
  get MHBookSeries()        { return MHBookSeries; },
  get MHComicBook()         { return MHComicBook; },
  get MHComicBookSeries()   { return MHComicBookSeries; },
  get MHGame()              { return MHGame; },
  get MHGameSeries()        { return MHGameSeries; },
  get MHGraphicNovel()      { return MHGraphicNovel; },
  get MHGraphicNovelSeries(){ return MHGraphicNovelSeries; },
  get MHMovie()             { return MHMovie; },
  get MHMovieSeries()       { return MHMovieSeries; },
  get MHMusicVideo()        { return MHMusicVideo; },
  get MHNovella()           { return MHNovella; },
  get MHPeriodical()        { return MHPeriodical; },
  get MHPeriodicalSeries()  { return MHPeriodicalSeries; },
  get MHShowEpisode()       { return MHShowEpisode; },
  get MHShowSeason()        { return MHShowSeason; },
  get MHShowSeries()        { return MHShowSeries; },
  get MHSong()              { return MHSong; },
  get MHSpecial()           { return MHSpecial; },
  get MHSpecialSeries()     { return MHSpecialSeries; },
  get MHTrailer()           { return MHTrailer; },

  get MHCollection(){ return MHCollection; },

  get MHImage(){ return MHImage; },
  get MHContext(){ return MHContext; },
  get MHMetaData(){ return MHMetaData; },

  get MHTrait()         { return MHTrait; },
  get MHTraitGroup()    { return MHTraitGroup; },
  get MHGenre()         { return MHGenre; },
  get MHSubGenre()      { return MHSubGenre; },
  get MHMood()          { return MHMood; },
  get MHQuality()       { return MHQuality; },
  get MHStyleElement()  { return MHStyleElement; },
  get MHStoryElement()  { return MHStoryElement; },
  get MHMaterialSource(){ return MHMaterialSource; },
  get MHTheme()         { return MHTheme; },
  get MHAchievements()  { return MHAchievements; },
  get MHEra()           { return MHEra; },
  get MHAudience()      { return MHAudience; },
  get MHFlag()          { return MHFlag; },
  get MHGraphGenre()    { return MHGraphGenre; },

  get MHContributor()                   { return MHContributor; },
  get MHRealIndividualContributor()     { return MHRealIndividualContributor; },
  get MHRealGroupContributor()          { return MHRealGroupContributor; },
  get MHFictionalIndividualContributor(){ return MHFictionalIndividualContributor; },
  get MHFictionalGroupContributor()     { return MHFictionalGroupContributor; },

  get MHSource(){ return MHSource; },
  get MHSubscription(){ return MHSubscription; },
  get MHSourceFormat(){ return MHSourceFormat; },
  get MHSourceMethod(){ return MHSourceMethod; },
  get MHSourceMedium(){ return MHSourceMedium; },
  get MHSourceModel() { return MHSourceModel; }
};
