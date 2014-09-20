/**
 * Created by Ryan Bogle on 9/19/14.
 */
(function(){
  'use strict';

  /*
    TODO
      'setup-model.js',
      'internal/MHCache.js',
      'cleanup-model.js'
   */

  // Base Models
  import { MHObject }           from './base/MHObject.js';
  import { MHEmbeddedObject }   from './base/MHEmbeddedObject.js';
  import { MHEmbeddedRelation } from './base/MHEmbeddedRelation.js';
  import { MHRelationalPair }   from './base/MHRelationalPair.js';


  // Action Models
  import { MHAction }   from './action/MHAction.js';
  import { MHAdd }      from './action/MHAdd.js';
  import { MHComment }  from './action/MHComment.js';
  import { MHCreate }   from './action/MHCreate.js';
  import { MHLike }     from './action/MHLike.js';
  import { MHFollow }   from './action/MHFollow.js';
  import { MHPost }     from './action/MHPost.js';

  // User Models
  import { MHUser }         from './user/MHUser.js';
  import { MHLoginSession } from './user/MHLoginSession.js';

  import { MHSocial } from './social/MHSocial.js';


  // Media Models
  import { MHMedia }              from './media/MHMedia.js';
  import { MHAlbum }              from './media/MHAlbum.js';
  import { MHAlbumSeries }        from './media/MHAlbumSeries.js';
  import { MHAnthology }          from './media/MHAnthology.js';
  import { MHBook }               from './media/MHBook.js';
  import { MHBookSeries }         from './media/MHBookSeries.js';
  import { MHComicBook }          from './media/MHComicBook.js';
  import { MHComicBookSeries }    from './media/MHComicBookSeries.js';
  import { MHGame }               from './media/MHGame.js';
  import { MHGameSeries }         from './media/MHGameSeries.js';
  import { MHGraphicNovel }       from './media/MHGraphicNovel.js';
  import { MHGraphicNovelSeries } from './media/MHGraphicNovelSeries.js';
  import { MHMovie }              from './media/MHMovie.js';
  import { MHMovieSeries }        from './media/MHMovieSeries.js';
  import { MHMusicVideo }         from './media/MHMusicVideo.js';
  import { MHNovella }            from './media/MHNovella.js';
  import { MHPeriodical }         from './media/MHPeriodical.js';
  import { MHPeriodicalSeries }   from './media/MHPeriodicalSeries.js';
  import { MHShowEpisode }        from './media/MHShowEpisode.js';
  import { MHShowSeason }         from './media/MHShowSeason.js';
  import { MHShowSeries }         from './media/MHShowSeries.js';
  import { MHSong }               from './media/MHSong.js';
  import { MHSpecial }            from './media/MHSpecial.js';
  import { MHSpecialSeries }      from './media/MHSpecialSeries.js';
  import { MHTrailer }            from './media/MHTrailer.js';

  import { MHCollection } from './collection/MHCollection.js';

  import { MHImage } from './image/MHImage.js';


  // Trait Models
  import { MHTrait }      from './trait/MHTrait.js';
  import { MHTraitGroup } from './trait/MHTraitGroup.js';


  // Contributor Models
  import { MHContributor }                    from './contributor/MHContributor.js';
  import { MHRealIndividualContributor }      from './contributor/MHRealIndividualContributor.js';
  import { MHRealGroupContributor }           from './contributor/MHRealGroupContributor.js';
  import { MHFictionalIndividualContributor } from './contributor/MHFictionalIndividualContributor.js';
  import { MHFictionalGroupContributor }      from './contributor/MHFictionalGroupContributor.js';


  // Source Models
  import { MHSourceFormat } from './source/MHSourceFormat.js';
  import { MHSourceMethod } from './source/MHSourceMethod.js';
  import { MHSourceMedium } from './source/MHSourceMedium.js';
  import { MHSourceModel }  from './source/MHSourceModel.js';

  export var models = {
    get MHObject(){ return MHObject; },
    get MHEmbeddedObject(){ return MHEmbeddedObject; },
    get MHEmbeddedRelation(){ return MHEmbeddedRelation; },
    get MHRelationalPair(){ return MHRelationalPair; },
    get MHAction(){ return MHAction; },
    get MHAdd(){ return MHAdd; },
    get MHComment(){ return MHComment; },
    get MHCreate(){ return MHCreate; },
    get MHLike(){ return MHLike; },
    get MHFollow(){ return MHFollow; },
    get MHPost(){ return MHPost; },
    get MHUser(){ return MHUser; },
    get MHLoginSession(){ return MHLoginSession; },
    get MHSocial(){ return MHSocial; },
    get MHMedia(){ return MHMedia; },
    get MHAlbum(){ return MHAlbum; },
    get MHAlbumSeries(){ return MHAlbumSeries; },
    get MHAnthology(){ return MHAnthology; },
    get MHBook(){ return MHBook; },
    get MHBookSeries(){ return MHBookSeries; },
    get MHComicBook(){ return MHComicBook; },
    get MHComicBookSeries(){ return MHComicBookSeries; },
    get MHGame(){ return MHGame; },
    get MHGameSeries(){ return MHGameSeries; },
    get MHGraphicNovel(){ return MHGraphicNovel; },
    get MHGraphicNovelSeries(){ return MHGraphicNovelSeries; },
    get MHMovie(){ return MHMovie; },
    get MHMovieSeries(){ return MHMovieSeries; },
    get MHMusicVideo(){ return MHMusicVideo; },
    get MHNovella(){ return MHNovella; },
    get MHPeriodical(){ return MHPeriodical; },
    get MHPeriodicalSeries(){ return MHPeriodicalSeries; },
    get MHShowEpisode(){ return MHShowEpisode; },
    get MHShowSeason(){ return MHShowSeason; },
    get MHShowSeries(){ return MHShowSeries; },
    get MHSong(){ return MHSong; },
    get MHSpecial(){ return MHSpecial; },
    get MHSpecialSeries(){ return MHSpecialSeries; },
    get MHTrailer(){ return MHTrailer; },
    get MHCollection(){ return MHCollection; },
    get MHImage(){ return MHImage; },
    get MHTrait(){ return MHTrait; },
    get MHTraitGroup(){ return MHTraitGroup; },
    get MHContributor(){ return MHContributor; },
    get MHRealIndividualContributor(){ return MHRealIndividualContributor; },
    get MHRealGroupContributor(){ return MHRealGroupContributor; },
    get MHFictionalIndividualContributor(){ return MHFictionalIndividualContributor; },
    get MHFictionalGroupContributor(){ return MHFictionalGroupContributor; },
    get MHSourceFormat(){ return MHSourceFormat; },
    get MHSourceMethod(){ return MHSourceMethod; },
    get MHSourceMedium(){ return MHSourceMedium; },
    get MHSourceModel(){ return MHSourceModel; }
  };

}());
