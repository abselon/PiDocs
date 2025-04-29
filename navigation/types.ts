export type RootStackParamList = {
    Auth: { screen: keyof AuthStackParamList };
    Home: undefined;
    AddDocument: undefined;
    Categories: { category?: string };
    DocumentDetails: { documentId: string };
    ScanID: undefined;
    Settings: undefined;
    Backup: undefined;
    BrowseDocs: undefined;
    Profile: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Documents: undefined;
    AddDocument: undefined;
    Profile: undefined;
};

export type HomeStackParamList = {
    HomeScreen: undefined;
    DocumentDetail: { documentId: string };
};

export type DocumentsStackParamList = {
    DocumentList: undefined;
    DocumentDetail: { documentId: string };
}; 