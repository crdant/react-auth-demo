import React, { Component } from 'react';
import Swiper from 'react-id-swiper';
import { Fetcher } from 'jso';

import 'react-id-swiper/src/styles/css/swiper.css';

class Product extends Component {
  render() {
    console.log(this.props.product)
    return (
      <div key={this.props.product.id}>
        <img src={this.props.product.image} className="img" width="950" height="475"/>
        <h3>{this.props.product.text}</h3>
      </div>
    )
  }
};

class Products extends Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      products:[]
    }
  }

  componentDidMount() {
    let client = new Fetcher(this.props.auth);

    client.fetch(this.props.serviceUrl).then(
        (results) => {
          console.log(results)
          console.log("status code: " + results.status)
          if ( results.status == 401 ) {
            var error = new Error(results.statusText)
            error.response = results
            throw error
          }
          return results.json();
        }
      ).then(
        (data) => {
          console.log("got some data")
          this.setState({
            isLoaded: true,
            products: data
          })
        }).catch(
          (error) => {
            console.log(error)
            if ( error.response.status == 401 ) {
              this.setState({
                isLoaded : true,
                needAuth : true
              })
            }
            this.setState({
              isLoaded: true,
              error
            });
        });
  }

  render() {
    const { error, isLoaded, needAuth, items } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else if (needAuth) {
      console.log("redirecting login page")
      return ( <Redirect to="/auth/login"/> );
    } else
      console.log("loaded now");
      const params = {
        pagination: {
          el: '.swiper-pagination',
          type: 'fraction',
          clickable: true
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        spaceBetween: 30
      }

      console.log(this.state.products)
      return (
        <Swiper {...params}>
          {this.state.products.map(
            (product, idx) => {
              return <div key={idx}><Product product={product}/></div>
            }
          )}
        </Swiper>
      );
    }
}

export default Products;
