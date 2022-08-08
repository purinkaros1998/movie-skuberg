import { useState, useEffect, useRef } from 'react';
import { Row, Col, Input, Card, Modal, Image, Button, Menu, Dropdown, List, Typography } from 'antd'
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import axios from 'axios'
import Qrcode from 'qrcode.react'
import promptpay from './assets/imgs/THAI-QR_Payment.png'
import Countdown from 'react-countdown';

function App() {

  const clearInput = useRef(null)
  const [price, setPrice] = useState(0)
  const [amount, setAmount] = useState(0)
  const [modalSearchData, setModalSearchData] = useState({})
  const [dataCart, setDataCart] = useState(() => {
    const sessionCart = sessionStorage.getItem('cart')
    const cartArray = JSON.parse(sessionCart)
    return cartArray || []
  })
  const [count, setCount] = useState(0)
  const [movieDetail, setMovieDetail] = useState([])
  const [dataMovie, setDataMovie] = useState([])
  const [state, setState] = useState({
    search: false,
    addPrice: false,
  })

  const [stateModal, setStateModal] = useState({
    type: '',
    title: '',
    visible: false,
    containerStyle: {},
    content: <></>,
    onCancel: () => { },
    onOk: () => { }
  })

  useEffect(() => {
    fetchAPI()
  }, [])


  useEffect(() => {
    if (dataCart) {
      let sumPrice = 0
      let price = dataCart.reduce((total, dataPrice) => total + dataPrice.price, 0)

      if (count > 3 && count <= 5) {
        sumPrice = price - (price * 10 / 100)
      } else if (count > 5) {
        sumPrice = price - (price * 20 / 100)
      } else {
        sumPrice = price
      }
      setAmount(sumPrice)
    }
  }, [dataCart, count])


  useEffect(() => {
    if (price) {
      setPrice(0)
      const handleSubmitPrice = (data, price) => {
        let addPriceforitems = dataMovie?.results.map(item => {
          if (item.id === data.id) {
            return { ...item, price }
          } else {
            return item
          }
        })
        setDataMovie({ results: addPriceforitems })
        sessionStorage.setItem('sessionDataMovie', JSON.stringify(addPriceforitems))
      }
      handleSubmitPrice(modalSearchData, price)

    }

  }, [price, modalSearchData, dataMovie])


  const fetchAPI = async () => {
    const sessionMovieArray = JSON.parse(sessionStorage.getItem('sessionDataMovie'))
    if (sessionMovieArray === null) {
      const responseAPI = await axios.get('https://api.themoviedb.org/3/search/movie?api_key=98bb5ad555f5e9789df1e8b4db8d4da7&query=a')
      setDataMovie(responseAPI.data)
    } else {
      setDataMovie({ results: sessionMovieArray })
    }
  }

  const onHandleSearch = (event) => {
    const titleName = event.target.value
    setState({ ...state, search: true })
    if (dataMovie) {
      const filterSearch = dataMovie.results.filter(fil => fil.title === titleName)
      if (filterSearch.length === 0) {

        Modal.error({
          title: 'Error',
          content: `Can't find movie! Please try again`,
        });
      } else {
        setMovieDetail(filterSearch)
        setDataMovie([])

      }

    }
  }

  const handleAddPrice = (data) => {
    setStateModal({
      type: "price",
      title: 'Add Price',
      visible: true,
      content: <>
        <Row><Col span={24}><Input type={'number'} onChange={(event) => setPrice(Number(event.target.value))} /></Col></Row>
      </>,
      containerStyle: { width: "100%" },
      onCancel: () => { onClearForm() },
      onOk: () => { onClearForm() }

    })
    setModalSearchData(data)
  }


  const handleBackPage = async () => {
    await fetchAPI()
    setState({ ...state, search: false })
  }

  const handleAddCart = async (val) => {
    setCount(count + 1)
    setDataCart([...dataCart, val])
    sessionStorage.setItem("cart", JSON.stringify([...dataCart, val]))
  }

  const onClearState = () => {
    setDataCart([])
    setCount(0)
    sessionStorage.removeItem("cart")
  }

  const onClearForm = () => {
    setStateModal({ ...stateModal, visible: false })
    setPrice(0)
  }

  const handlePayment = () => {
    setStateModal({
      type: 'payment',
      title: 'Place Order',
      visible: true,
      content: <>
        <img src={promptpay} alt="promptpay" style={{ width: "100%" }} />
        <Qrcode value={123456798} size={200} />
        <div style={{ marginTop: 10, fontSize: 16, fontWeight: 'bold' }}>{`฿${amount} Baht`}</div>
      </>,
      containerStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' },
      onCancel: () => { setStateModal({ ...stateModal, visible: false }) },
      onOk: () => { setStateModal({ ...stateModal, visible: false }) }
    })
  }


  const menu = (
    <Menu
      items={[
        {
          label: <>
            <List
              header={null}
              footer={<><Row justify='space-between' align='middle' style={{ marginBottom: 10 }}>
                <Col>{`฿${amount} Baht`}</Col>
                <Col><Button type='primary' danger style={{ borderRadius: 10 }} onClick={() => onClearState()}>Clear</Button></Col>
              </Row>
                <Button block type='primary' style={{ borderRadius: 10 }} onClick={() => handlePayment()}>Place order</Button>
              </>}
              bordered
              dataSource={dataCart}
              renderItem={(item, i) => {
                return <List.Item>
                  <Typography.Text>
                    <img style={{ width: '50px' }} src={`https://image.tmdb.org/t/p/original/${item.poster_path}`} alt={item.original_title} />
                    {item.original_title}
                    <span> x 1</span>{' '}
                    {` `}
                    {`${item.price} Baht`}
                  </Typography.Text>
                </List.Item>
              }
              }
            />
          </>,
          key: '0'
        }
      ]}
    />
  );

  const renderCountdown = ({ minutes, seconds, completed }) => {
    if (completed) {
      setStateModal({ ...stateModal, visible: false })
    } else {
      return <span style={{ fontWeight: 'bold', fontSize: 16 }}>{minutes}:{seconds}</span>;
    }
  };


  return <>
    <div style={{ backgroundColor: '#2B2A2A', position: 'absolute', top: 50, left: 0, right: 0 }}>
      <Row style={{ marginTop: 30, justifyContent: 'space-between' }}>
        <Col span={8}>
          <Input
            ref={clearInput}
            placeholder={"Search Movie..."}
            suffix={<SearchOutlined />}
            onPressEnter={(event) => event.key === "Enter" && onHandleSearch(event)}
            style={{
              border: "1px solid #143bba", borderRadius: 50, fontSize: 14, fontWeight: 400
            }}
          />
        </Col>
        {state.search && <Col><Button type="primary" style={{ borderRadius: 10 }} onClick={handleBackPage}>Back</Button></Col>}
      </Row>

      <div className="site-card-wrapper">
        <div className='card-responsive'>

          {dataMovie && dataMovie?.results?.map((items, i) => {
            return <Row key={i}>
              <Col>
                <Card
                  hoverable
                  style={{ width: "100%", margin: '0 20px 20px 20px', maxWidth: 250, height: "95%", borderRadius: "20px 20px" }}
                  cover={<img alt={items.original_title} src={`https://image.tmdb.org/t/p/original/${items.poster_path}`} style={{ borderRadius: "20px 20px 0 0" }} />}
                >
                  <Card.Meta title={items.original_title} description={items.overview} />
                  <Row style={{ margin: "10px 0px" }} justify='space-between' align='middle'>
                    <Col><Button type='primary' style={{ borderRadius: 10 }} onClick={() => handleAddPrice(items)}>Add Price</Button> </Col>
                    {items.price && <Col> {`฿ ${items.price}`}</Col>}
                  </Row>
                  {items.price &&
                    <Row>
                      <Col><Button type='primary' style={{ backgroundColor: 'green', border: 0, borderRadius: 10 }} onClick={() => handleAddCart(items)}>Add Cart</Button></Col>
                    </Row>
                  }
                </Card>
              </Col>
            </Row>
          })}

          {movieDetail && movieDetail?.map((item, i) => {
            return <Row key={i}>
              <Col>
                <Card
                  hoverable
                  style={{ width: "100%", maxWidth: "50%", margin: '0 10px' }}
                  cover={<div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Image.PreviewGroup>
                      <Image style={{ width: "100%" }} src={`https://image.tmdb.org/t/p/original/${item.backdrop_path}`} />
                    </Image.PreviewGroup>
                  </div>}
                >
                  <Card.Meta
                    title={item.original_title}
                    description={<>
                      {item.overview}
                      <br /> <br />
                      {`popularity: ${item.popularity}`}
                      <br />
                      {`release_date: ${item.release_date}`}
                      <br />
                      {`vote_average: ${item.vote_average}`}
                      <br />
                      {`vote_count: ${item.vote_count}`}
                    </>
                    }
                  />

                </Card>
              </Col>
            </Row>
          })}
        </div>
      </div>
    </div>

    <div className='shoping-menu'>
      <Dropdown overlay={menu} trigger={['click']} overlayStyle={{
        position: "fixed",
        zIndex: 999,
        top: "5px",
        left: "0px",
        width: "40%",
        height: "300px",
        overflow: "auto"
      }}>
        <a onClick={(e) => e.preventDefault()} href={'null'}>
          {dataCart.length > 0 &&
            <div style={{
              position: "fixed",
              zIndex: 999,
              color: "#fff",
              width: "15px",
              backgroundColor: "#ff0000",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
              {dataCart.length}
            </div>
          }
          <Button style={{ borderRadius: 10 }}><ShoppingCartOutlined style={{ fontSize: 20, color: '#000' }} /></Button>
        </a>
      </Dropdown>

    </div>

    <Modal
      title={stateModal.title}
      visible={stateModal.visible}
      bodyStyle={stateModal.containerStyle}
      onCancel={stateModal.onOk}
      onOk={stateModal.onCancel}
      maskClosable={false}
    >
      {stateModal.content}
      {stateModal.type === "payment" && <Countdown date={Date.now() + 60000} renderer={renderCountdown} />}
    </Modal>
  </>
}

export default App;
