(function () {
    'use strict';

    const qs = (selector, parent = document) => parent.querySelector(selector);
    const qsa = (selector, parent = document) => [...parent.querySelectorAll(selector)];

    function showToast(message) {
        let toast = qs('#toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    async function copyText(value) {
        try {
            await navigator.clipboard.writeText(value);
            return true;
        } catch (error) {
            const textarea = document.createElement('textarea');
            textarea.value = value;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);
            let copied = false;
            try {
                copied = document.execCommand('copy');
            } catch (copyError) {
                copied = false;
            }
            textarea.remove();
            return copied;
        }
    }

    async function shareProduct() {
        const button = qs('#share-product');
        if (!button) return;

        const shareUrl = button.dataset.shareUrl || window.location.href;
        const title = document.querySelector('h1.product-title')?.textContent.trim() || document.title;
        const shareData = {
            title,
            text: `Check this product deal: ${title}`,
            url: shareUrl
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            } catch (error) {
                if (error && error.name === 'AbortError') return;
            }
        }

        if (await copyText(shareUrl)) {
            showToast('Buy link copied');
        } else {
            showToast('Unable to copy the buy link');
        }
    }

    function setupImageModal() {
        const image = qs('#product-image');
        const modal = qs('#product-image-modal');
        const modalImage = qs('#product-modal-image');
        const close = qs('#product-image-close');

        if (!image || !modal || !modalImage) return;

        const open = () => {
            modalImage.src = image.currentSrc || image.src;
            modalImage.alt = image.alt || '';
            modal.setAttribute('aria-hidden', 'false');
            modal.classList.add('show');
            document.body.classList.add('modal-open');
        };

        const hide = () => {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
        };

        image.addEventListener('click', open);
        if (close) close.addEventListener('click', hide);
        modal.addEventListener('click', event => {
            if (event.target === modal) hide();
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') hide();
        });
    }

    function setupCouponTrigger() {
        const buttons = qsa('.open-coupon-trigger, #check-offers');
        if (!buttons.length) return;

        buttons.forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();

                if (typeof window.openCouponPopup === 'function') {
                    window.openCouponPopup();
                    return;
                }

                const legacyButton = qs('#openCouponBtn');
                if (legacyButton) {
                    legacyButton.click();
                    return;
                }

                showToast('Offers are currently unavailable');
            });
        });
    }

    function setupBrokenImageFallback() {
        const image = qs('#product-image');
        if (!image) return;
        image.addEventListener('error', () => {
            if (image.dataset.fallbackApplied === '1') return;
            image.dataset.fallbackApplied = '1';
            image.removeAttribute('srcset');
            image.src = '/assets-original/products/placeholder.png';
        });
    }

    function setup() {
        const shareButton = qs('#share-product');
        if (shareButton) shareButton.addEventListener('click', shareProduct);

        setupImageModal();
        setupCouponTrigger();
        setupBrokenImageFallback();
    }

    document.addEventListener('DOMContentLoaded', setup);
})();
