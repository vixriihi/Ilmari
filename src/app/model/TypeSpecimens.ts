/**
 * API documentation
 * To use this api you need an access token. To get the token, send a post request with your email address to api-users resource and one
 * will be send to your. See below for information on how to use this api and if you have any questions you can contact us at
 * helpdesk@laji.fi. Place refer to [schema.laji.fi](http://schema.laji.fi/) for more information about the used vocabulary
 *
 * OpenAPI spec version: 0.1
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

export interface TypeSpecimens {
    /**
     * Unique ID for the object. This will be automatically generated.
     */
    id: string;

    /**
     * PUBLIC: all data can be published; PROTECTED: exact locality is hidden;
     * PRIVATE: most of the data is hidden. If blank means same as public
     */
    publicityRestrictions?: TypeSpecimens.PublicityRestrictionsEnum;

    typeAuthor?: string;

    /**
     * Publication reference for original description or basionyme
     */
    typeBasionymePubl?: string;

    typeNotes?: string;

    typePubl?: string;

    typeSeriesID?: string;

    typeSpecies?: string;

    /**
     * Is this holotype, paratype, syntype etc...
     */
    typeStatus?: TypeSpecimens.TypeStatusEnum;

    typeSubspecies?: string;

    typeSubspeciesAuthor?: string;

    /**
     * Verification whether this really is a type?
     */
    typeVerification?: TypeSpecimens.TypeVerificationEnum;

    typif?: string;

    typifDate?: string;

    /**
     * Context for the given json
     */
    '@Context'?: string;

    /**
     * This field is automatically populated with the objects type and any user given value in here will be ignored!
     */
    '@Type'?: string;

}
export namespace TypeSpecimens {
    export enum PublicityRestrictionsEnum {
        PublicityRestrictionsPublic = <any> 'MZ.publicityRestrictionsPublic',
        PublicityRestrictionsProtected = <any> 'MZ.publicityRestrictionsProtected',
        PublicityRestrictionsPrivate = <any> 'MZ.publicityRestrictionsPrivate'
    }
    export enum TypeStatusEnum {
        TypeStatusType = <any> 'MY.typeStatusType',
        TypeStatusHolotype = <any> 'MY.typeStatusHolotype',
        TypeStatusSyntype = <any> 'MY.typeStatusSyntype',
        TypeStatusParatype = <any> 'MY.typeStatusParatype',
        TypeStatusLectotype = <any> 'MY.typeStatusLectotype',
        TypeStatusParalectotype = <any> 'MY.typeStatusParalectotype',
        TypeStatusNeotype = <any> 'MY.typeStatusNeotype',
        TypeStatusAllotype = <any> 'MY.typeStatusAllotype',
        TypeStatusNeoallotype = <any> 'MY.typeStatusNeoallotype',
        TypeStatusIsotype = <any> 'MY.typeStatusIsotype',
        TypeStatusEpitype = <any> 'MY.typeStatusEpitype',
        TypeStatusIsolectotype = <any> 'MY.typeStatusIsolectotype',
        TypeStatusIsoepitype = <any> 'MY.typeStatusIsoepitype',
        TypeStatusIsoneotype = <any> 'MY.typeStatusIsoneotype',
        TypeStatusIsoparatype = <any> 'MY.typeStatusIsoparatype',
        TypeStatusIsosyntype = <any> 'MY.typeStatusIsosyntype',
        TypeStatusOriginalMaterial = <any> 'MY.typeStatusOriginalMaterial',
        TypeStatusCotype = <any> 'MY.typeStatusCotype',
        TypeStatusTopotype = <any> 'MY.typeStatusTopotype',
        TypeStatusHomotype = <any> 'MY.typeStatusHomotype',
        TypeStatusNo = <any> 'MY.typeStatusNo',
        TypeStatusPossible = <any> 'MY.typeStatusPossible',
        TypeStatusObscure = <any> 'MY.typeStatusObscure',
        TypeStatusTypeStrain = <any> 'MY.typeStatusTypeStrain',
        TypeStatusPathovarReferenceStrain = <any> 'MY.typeStatusPathovarReferenceStrain'
    }
    export enum TypeVerificationEnum {
        TypeVerificationVerified = <any> 'MY.typeVerificationVerified',
        TypeVerificationUnverified = <any> 'MY.typeVerificationUnverified',
        TypeVerificationProbable = <any> 'MY.typeVerificationProbable',
        TypeVerificationDoubtful = <any> 'MY.typeVerificationDoubtful'
    }
}
