/** Wait for ResourceLoader whether this script loads before or after MediaWiki. */
function waitForMediaWiki(): Promise<void> {
    return new Promise(resolve => {
        const queue = window.RLQ = window.RLQ || [];
        queue.push(() => resolve());
    });
}

async function startReviewTool(): Promise<void> {
    await waitForMediaWiki();
    await mw.loader.using('mediawiki.util');

    // State and other application modules access MediaWiki during initialization.
    // Keep their evaluation deferred until ResourceLoader is ready.
    const { init } = await import('./main');
    await init();
}

void startReviewTool().catch(error => console.error('[ReviewTool] Initialization failed', error));

export {};
