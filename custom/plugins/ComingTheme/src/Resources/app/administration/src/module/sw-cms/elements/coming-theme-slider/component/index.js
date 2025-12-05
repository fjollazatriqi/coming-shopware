import template from './sw-cms-el-coming-theme-slider.html.twig';
import './sw-cms-el-coming-theme-slider.scss';

const { Component, Mixin, Context, Utils } = Shopware;
const { cloneDeep } = Utils.object;

Component.register('sw-cms-el-coming-theme-slider', {
    template,

    mixins: [Mixin.getByName('cms-element')],

    inject: ['repositoryFactory'],

    data() {
        return {
            previewBackgroundMedia: [],
            previewBackgroundMediaHasInitLoaded: false,
        };
    },

    computed: {
        mediaRepository() {
            return this.repositoryFactory.create('media');
        },

        previewSlides() {
            if (this.element.config && this.element.config.slides.value) {
                const activeSlides = this.element.config.slides.value.filter(
                    (slide) => {
                        return slide.active;
                    }
                );

                if (
                    this.element.config.sliderSettings.value.loop &&
                    activeSlides.length <
                    this.element.config.sliderSettings.value.items
                ) {
                    const missingSlideCount =
                        this.element.config.sliderSettings.value.items -
                        activeSlides.length;

                    for (let i = 0; i < missingSlideCount; i++) {
                        activeSlides.push(
                            activeSlides[i % activeSlides.length]
                        );
                    }

                    return activeSlides;
                }

                if (
                    activeSlides.length >
                    this.element.config.sliderSettings.value.items
                ) {
                    return activeSlides.slice(
                        0,
                        this.element.config.sliderSettings.value.items
                    );
                }

                return activeSlides;
            }
        },

        previewSlidesProxy() {
            return cloneDeep(this.previewSlides);
        },
    },

    watch: {
        previewSlidesProxy: {
            deep: true,
            handler: function (newSlides, oldSlides) {
                newSlides.forEach(async (slide, index) => {
                    if (
                        this.previewBackgroundMediaHasInitLoaded &&
                        index < oldSlides.length
                    ) {
                        if (
                            slide.backgroundMedia &&
                            slide.backgroundMedia !==
                            oldSlides[index].backgroundMedia
                        ) {
                            this.loadAndReplacePreviewBackgroundMedia(
                                slide.backgroundMedia
                            );
                        }

                        return;
                    }

                    if (slide.backgroundMedia) {
                        const mediaEntity = this.previewBackgroundMedia.find(
                            (mediaEntity) => mediaEntity.id === slide.backgroundMedia

                        );

                        if (!mediaEntity) {
                            this.loadAndReplacePreviewBackgroundMedia(
                                slide.backgroundMedia
                            );
                        }
                    }
                });

                if (!this.previewBackgroundMediaHasInitLoaded) {
                    this.previewBackgroundMediaHasInitLoaded = true;
                }
            },
        },
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            this.initElementConfig('coming-theme-slider');
            this.initElementData('coming-theme-slider');

            if (!this.element.config.slides.value[0].id) {
                this.element.config.slides.value[0].id = Utils.createId();
            }
        },

    },
});
