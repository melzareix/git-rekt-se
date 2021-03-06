<template>
    <div class="step2">
        <div class="column is-6 is-offset-1">

            <div class="box content">
                <h3 class="booking-header"> Booking Information</h3>
                <div class="field">
                    <p class="label">Credit or debit card</p>
                    <div id="card-element" class="seventy-width el-input__inner"></div>
                    <div id="card-errors" class="help is-danger" v-show="stripeError">{{ stripeError }}</div>
                </div>

                <div class="field">
                    <p class="label">Coupon (optional)</p>
                    <el-input placeholder="coupon code" class="seventy-width" v-model="coupon"></el-input>
                    <el-button type="primary" @click="validateCoupon" :loading="couponLoading">Validate</el-button>
                    <span class="help is-danger" v-show="invalidCoupon">{{ invalidCoupon }}</span>
                    <span class="help is-primary" v-show="validCoupon">{{ validCoupon }}</span>
                </div>
            </div>

        </div>

        <div class="column is-4">
            <div class="box content">
                <h1 class="title is-5">{{ service.name }}</h1>
                <p class="subtitle is-6">{{ service.businessName }}</p>

                <div class="timing">
                    <p class="icon-margin">
                        <span class="icon">
                                          <i class="checkout-i fa fa-calendar"></i>
                </span> {{ form.offering.startDate | moment}}
                    </p>
                    <p class="icon-margin">
                        <span class="icon">
                <i class="checkout-i fa fa-calendar"></i>
                </span> {{ form.offering.endDate | moment}}
                    </p>

                    <p class="icon-margin">
                        <span classs="icon">
                 <i class="checkout-i fa fa-clock-o"></i>
                </span> {{ getServiceDuration(form.offering.startDate, form.offering.endDate) }}
                    </p>
                </div>

                <div class="serviceloc">
                    <p class="icon-margin">
                        <span classs="icon">
                <i class="checkout-i fa fa-location-arrow"></i>
                </span> {{ form.offering.location }}
                    </p>

                    <p class="icon-margin">
                        <span classs="icon">
                            <i class="checkout-i fa fa-map-marker"></i>
                       </span>
                        {{ form.offering.address }}
                    </p>
                </div>

                <div class="payment">
                    <p class="icon-margin">
                        <span classs="icon">
                            <i class="checkout-i fa fa-money"></i>
                        </span>
                        {{ form.offering.price }} EGP
                    </p>
                </div>

                <hr/>

                <div class="coupon" v-show="form.coupon">

                    <p>
                        <span classs="icon">
                             <i class="checkout-i fa fa-tag"></i>
                        </span> {{ coupon }}:
                        <span class="is-pulled-right"> -{{ form.offering.price - price }} EGP</span>
                    </p>
                    <hr/>
                </div>

                <p class="title is-5">
                    Subtotal:
                    <span class="is-pulled-right">{{ price }} EGP</span>
                </p>
                <el-button type="success" @click="generateToken">Confirm Booking</el-button>
            </div>
        </div>
    </div>
</template>

<script>
 /**
  * This component represent the second step in bookin.
  */
  import moment from 'moment';
  import axios from 'axios';
  import clientAuth from '../../../services/auth/clientAuth';

  import { Service } from '../../../services/EndPoints';

  export default {
    /**
     * Props used by this component.
     * service: The service the client wishes to book.
     * form: An Object containing the branch, offering, coupon, and a token.
     */
    props: ['form', 'service'],

    /**
     * The date used by this component.
     */
    data() {
      return {
        stripe: '',
        card: '',
        stripeError: '',
        invalidCoupon: '',
        validCoupon: '',
        loader: '',
        coupon: undefined,
        couponLoading: false,
      };
    },
    /**
     * Computed attributes.
     */
    computed: {
      price() {
        const originalPrice = parseFloat(this.form.offering.price);
        const coupon = this.form.coupon;
        return originalPrice * (coupon ? ((100 - parseInt(coupon.discount, 10)) / 100.0) : 1);
      },
    },
    /**
     * Declare all the methods used by this component.
     */
    methods: {
      /**
       * Initialize Stripe
       */
      initStripe() {
        // eslint-disable-next-line no-undef
        this.stripe = Stripe('pk_test_BAf83Axjq8bck9Pbd36seTPS');
        const elements = this.stripe.elements();

        this.card = elements.create('card');

        const card = this.card;
        const style = {
          base: {
            color: '#32325d',
            lineHeight: '24px',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a',
          },
        };

        card.mount('#card-element', {
          style,
        });

        // Handle real-time validation errors from the card Element.
        const self = this;
        card.addEventListener('change', (event) => {
          self.stripeError = event.error ? event.error.message : '';
        });
      },
      /**
       * Validate a coupon entered by the client.
       */
      validateCoupon() {
        const url = Service().validateCoupon;
        this.form.coupon = '';
        this.invalidCoupon = '';
        this.validCoupon = '';
        this.couponLoading = true;

        axios
            .post(url, {
              code: this.coupon,
              serviceId: this.$route.params.ser_id,
            }, {
              headers: {
                Authorization: clientAuth.getJWTtoken(),
              },
            })
            .then((data) => {
              this.form.coupon = data.data;
              this.coupon = data.data.code;
              this.couponLoading = false;
              this.validCoupon = 'Coupon applied.';
            })
            .catch((e) => {
              this.couponLoading = false;
              this.invalidCoupon = e.response.data.errors[0];
            });
      },
      /**
       * Parse a service duration.
       */
      getServiceDuration(startDate, endDate) {
        const momentStartDate = moment(startDate);
        const momentEndDate = moment(endDate);
        return `${momentEndDate.diff(momentStartDate, 'days')} days.`;
      },
      /**
       * Generate Stripe Token
       */
      generateToken(e) {
        e.preventDefault();

        this.loader = this.$loading({
          fullscreen: true,
        });

        this.stripe
            .createToken(this.card)
            .then((result) => {
              if (result.error) {
                this.stripeError = result.error.message;
                this.loader.close();
                return;
              }
              this.form.token = result.token.id;
              this.$emit('tokenGenerated');
            }).catch(() => {
              this.loader.close();
              this.$toast.open({
                message: 'Failed to connect to Stripe.',
                position: 'bottom',
                type: 'is-danger',
              });
            });
      },

    },
    /**
     * Ran when component is mounted on the DOM.
     * Initialize Stripe.
     */
    mounted() {
      this.initStripe();
    },
    /**
     * Filters used by this component.
     */
    filters: {
      moment(date) {
        return moment(date).format('dddd MMMM Do YYYY.');
      },
    },
  };
</script>

<style>
    .serviceloc,
    .payment,
    .timing {
        margin-bottom: 1em;
    }

    .icon-margin {
        margin-bottom: 0.5em !important;
    }

    .checkout-i {
        font-size: 1.5rem !important;
    }

    .booking-header {
        border-bottom: 1px solid #dbdbdb;
        padding: 0.5em 0 0.5em 0;
    }
</style>
