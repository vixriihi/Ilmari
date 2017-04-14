import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';
import { IlmComponent } from './ilm.component';
import { GroupsComponent } from './groups/groups.component';
import { GroupsService } from './services/groups.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  LiveAnnouncer,
  MdCheckboxModule,
  MdProgressBarModule,
  MdSelectModule,
  MdSliderModule,
  MdSlideToggleModule,
  MdIconModule,
  MdDialogModule,
  MdChipsModule,
  MdTooltipModule,
  MdMenuModule,
  MdInputModule,
  MdCardModule,
  MdAutocompleteModule,
  MdButtonToggleModule,
  MdSnackBarModule,
  MdToolbarModule,
  MdSidenavModule,
  MdButtonModule,
  MdListModule,
  MdTabsModule
} from '@angular/material';
import { AgmCoreModule } from 'angular2-google-maps/core';
import { MapComponent } from './map/map.component';
import { FormComponent } from './form/form.component';
import { FileUploadComponent } from './form/file-upload/file-upload.component';
import { FileListComponent } from './form/file-list/file-list.component';
import { environment } from '../environments/environment';
import { AutocompleteService } from './services/autocomplete.service';
import 'hammerjs';
import { StoreModule } from '@ngrx/store';
import { MapDialogComponent } from './map-dialog/map-dialog.component';
import { LocationStoreService } from './services/location-store.service';
import { FormService } from './services/form.service';
import { InfoComponent } from './info/info.component';
import { StoreService } from './services/store.service';
import { DocumentDatabase } from './db/document.database';
import { StoreDatabase } from './db/store.database';
import { rootReducer } from './reducers/index';
import { FormActions } from './form/form.actions';
import { EffectsModule } from '@ngrx/effects';
import { FormEffects } from './form/form.efects';
import { ExtraComponent } from './form/extra/extra.component';
import { FieldComponent } from './form/extra/field/field.component';
import { SelectComponent } from './form/extra/field/select/select.component';
import { SettingsComponent } from './form/extra/settings/settings.component';
import { UserService } from './services/user.service';
import { ImageService } from './services/image.service';
import { DocumentService } from './services/document.service';
import { NearMeComponent } from './near-me/near-me.component';
import { WindowRef } from './ref/window.ref';
import { WarehouseService } from './services/warehouse.service';
import { SpeechService } from './services/speech.service';
import { TaxonService } from './services/taxon.service';
import { SpeechInputComponent } from './form/speech-input/speech-input.component';
import { SpeechSelectComponent } from './form/speech-input/types/speech-select/speech-select.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TaxonComponent } from './taxon/taxon.component';
import { TaxaDatabase } from './db/taxa.database';
import { TaxonModalComponent } from './taxon-modal/taxon-modal.component';
import { LoginComponent } from './login/login.component';
import { IlmRootComponent } from './ilm-root.component';
import { LoginSuccessComponent } from './login-success/login-success.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CollectionComponent } from './form/extra/field/collection/collection.component';
import { BufferComponent } from './form/buffer/buffer.component';
import { CarouselComponent } from './carousel/carousel.component';
import { ImageDatabase } from './db/image.database';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { DialogsService } from './services/dialog.service';
import { CapitalizePipe } from './pipes/capitalize.pipe';
import { MarkdownToHtmlModule } from 'markdown-to-html-pipe';
import { MomentModule } from 'angular2-moment';
import 'moment/locale/fi';


const appRoutes: Routes = [
  { path: 'user/login', component: LoginSuccessComponent },
  { path: '**', component: IlmComponent }
];

@NgModule({
  entryComponents: [
    MapDialogComponent,
    InfoComponent,
    LoginComponent,
    SettingsComponent,
    SpeechSelectComponent,
    TaxonModalComponent,
    ConfirmDialogComponent
  ],
  declarations: [
    IlmRootComponent,
    IlmComponent,
    GroupsComponent,
    MapComponent,
    FormComponent,
    FileUploadComponent,
    FileListComponent,
    MapDialogComponent,
    InfoComponent,
    ExtraComponent,
    FieldComponent,
    SelectComponent,
    SettingsComponent,
    NearMeComponent,
    SpeechInputComponent,
    SpeechSelectComponent,
    TaxonComponent,
    TaxonModalComponent,
    LoginComponent,
    LoginSuccessComponent,
    CollectionComponent,
    BufferComponent,
    CarouselComponent,
    ConfirmDialogComponent,
    CapitalizePipe
  ],
  imports: [
    MdTabsModule,
    MdSelectModule,
    MdInputModule,
    MdCardModule,
    MdMenuModule,
    MdSliderModule,
    MdSlideToggleModule,
    MdTooltipModule,
    MdDialogModule,
    MdIconModule,
    MdChipsModule,
    MdAutocompleteModule,
    MdCheckboxModule,
    MdProgressBarModule,
    MdButtonToggleModule,
    MdSnackBarModule,
    MdToolbarModule,
    MdSidenavModule,
    MdButtonModule,
    MdListModule,
    MomentModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    EffectsModule.run(FormEffects),
    StoreModule.provideStore(rootReducer),
    FlexLayoutModule,
    AgmCoreModule.forRoot({
      apiKey: environment.mapsToken
    }),
    NgxDatatableModule,
    MarkdownToHtmlModule
  ],
  providers: [
    LiveAnnouncer,
    GroupsService,
    AutocompleteService,
    LocationStoreService,
    FormService,
    ImageDatabase,
    DocumentDatabase,
    StoreDatabase,
    TaxaDatabase,
    StoreService,
    FormActions,
    UserService,
    ImageService,
    DocumentService,
    WindowRef,
    SpeechService,
    WarehouseService,
    TaxonService,
    DialogsService
  ],
  bootstrap: [IlmRootComponent]
})
export class IlmModule { }
