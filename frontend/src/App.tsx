import React, { useState } from 'react';
import ParallaxBackground from './components/ParallaxBackground/ParallaxBackground';
import GeneratorForm from './components/GeneratorForm/GeneratorForm';
import ServiceWorkerForm from './components/ServiceWorkerForm/ServiceWorkerForm';
import PreviewPanel from './components/PreviewPanel/PreviewPanel';
import CodeOutput from './components/CodeOutput/CodeOutput';
import SWCodeOutput from './components/SWCodeOutput/SWCodeOutput';
import styles from './App.module.scss';
import './styles/global.scss';

export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  startUrl: string;
  themeColor: string;
  backgroundColor: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  orientation: 'any' | 'portrait' | 'landscape';
  scope: string;
  lang: string;
}

type ActiveTab = 'manifest' | 'serviceworker';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('manifest');
  const [manifestConfig, setManifestConfig] = useState<PWAConfig | null>(null);
  const [swConfig, setSwConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleManifestGenerate = async (config: PWAConfig) => {
    setLoading(true);
    setTimeout(() => {
      setManifestConfig(config);
      setLoading(false);
    }, 1000);
  };

  const handleSWGenerate = async (config: any) => {
    setLoading(true);
    setTimeout(() => {
      setSwConfig(config);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className={styles.app}>
      <ParallaxBackground />
      
      <header className={styles.appHeader}>
        <h1>PWA Generator</h1>
        <p>Создайте Web App Manifest и Service Worker для вашего Progressive Web App</p>
      </header>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'manifest' ? styles.active : ''}`}
          onClick={() => setActiveTab('manifest')}
        >
          Web App Manifest
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'serviceworker' ? styles.active : ''}`}
          onClick={() => setActiveTab('serviceworker')}
        >
          Service Worker
        </button>
      </div>

      <div className={styles.appContent}>
        {activeTab === 'manifest' && (
          <>
            <GeneratorForm onSubmit={handleManifestGenerate} loading={loading} />
            {manifestConfig && (
              <>
                <PreviewPanel config={manifestConfig} />
                <CodeOutput config={manifestConfig} />
              </>
            )}
          </>
        )}

        {activeTab === 'serviceworker' && (
          <>
            <ServiceWorkerForm onSubmit={handleSWGenerate} loading={loading} />
            {swConfig && <SWCodeOutput config={swConfig} />}
          </>
        )}
      </div>
    </div>
  );
};

export default App;