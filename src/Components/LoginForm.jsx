import './LoginForm.css'
import Data from '../Components/Data.json';
import { useState } from 'react';

let leftlogo = `${Data.leftlogo}`
const LoginForm = () => {
  const [userdetails, setUserDetails] = useState({
    fname: '',
    lname: '',
    mobileno: '',
    email: ''
  });

  const [nameError, setNameError] = useState('');
  const [LastnameError, setLastNameError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [qrimg, SetQrimg] = useState('');
  const [submited, setSubmited] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [isloading , setIsLoading] = useState(false);

  // Validate user inputs
  const validateName = (name) => {
    if (name.length < 2) {
      setNameError('Please enter a valid first name');
      return false;
    } else {
      setNameError('');
      return true;
    }
  };

  const validateLastName = (lname) => {
    if (lname.length < 2) {
      setLastNameError('Please enter a valid last name.');
      return false;
    } else {
      setLastNameError('');
      return true;
    }
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      setMobileError('Please enter a valid mobile number.');
      return false;
    } else {
      setMobileError('');
      return true;
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({
      ...prev,
      [name]: value
    }));
    if (name === 'fname') validateName(value);
    if (name === 'lname') validateLastName(value); // Validate last name
    if (name === 'mobileno') validateMobile(value);
    if (name === 'email') validateEmail(value);
  };

  const formSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const isNameValid = validateName(userdetails.fname);
    const isLastNameValid = validateLastName(userdetails.lname);
    const isMobileValid = validateMobile(userdetails.mobileno);
    const isEmailValid = validateEmail(userdetails.email);

    if (isNameValid && isLastNameValid && isMobileValid && isEmailValid) {
      try {
        const formData = new FormData();
        formData.append('first_name', userdetails.fname);
        formData.append('last_name', userdetails.lname);
        formData.append('contact', userdetails.mobileno);
        formData.append('email', userdetails.email);
        formData.append('eid', 'test');
        formData.append('type', 'all');

        const response = await fetch('http://192.168.1.25/Zeal_Event/API/register.php', {
          method: 'POST',
          body: formData, // FormData automatically sets the correct content type
        });

        const data = await response.json();
        console.log('Response data:', data);

        if (data.Store === true) {
          setIsLoading(false);
          setSubmited(true);
          console.log(data.QR_FilePath);
          SetQrimg(data.QR_FilePath);
        }
        else if (data.Exists === true) {
          setUserExists(true);
          setIsLoading(false);
        }

      } catch (error) {
        console.error('Error:', error);
      }
    }else{
      setIsLoading(false)
    }
  };

  const showlogin = () => {
    setSubmited(false);
    setUserExists(false)
  }
  
  const downloadQr = async () => {
        try {
            const response = await fetch(`https://192.168.1.25/Zeal_Event/API/qrcode/images/?url=${encodeURIComponent(qrimg)}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const filename = imageUrl.split('/').pop() || 'downloaded-image.jpeg';
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download the image. Please check the URL or server configuration.');
        } finally {
         console.log('Finally')
        }
  };


  const shareQRCode = () => {
    // const qrcodeimg = generateQRCode();
    if (navigator.share) {
        fetch(`http://192.168.1.25/Zeal_Event/API/${qrimg}`)
            .then((res) => res.blob())
            .then((blob) => {
                navigator.share({
                    title: 'My Zeal ID QR Code',
                    files: [new File([blob], 'qrcode.png', { type: 'image/png' })],
                })
                    .then(() => console.log('QR code shared successfully!'))
                    .catch((error) => console.error('Error sharing QR code:', error));
            })
            .catch((error) => console.error('Error creating QR code file:', error));
    } else if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
        // const whatsappUrl = `https://wa.me/?te=${encodeURIComponent('Here is your QR code: ' + qrimg)}`;
        // window.open(whatsappUrl, '_blank');
        setShowShareButtons(true);
    }
};
  
  return (
    <>
      <div className='normal-container'>
        <div className="logo-container container">
          <img src= {leftlogo} className='firstimg' />
        </div>
         <div className="form-conatiner">
        {
          submited ? (
            <div>
              {/* Ensure this path is correct */}
              {qrimg && (
                <>
                <div className="qrimg-container">
                  <h3>Zeal Id QrCode</h3>
                 <img
                  src={`http://192.168.1.25/Zeal_Event/API/${qrimg}`}
                  alt="QR Code"
                  style={{ width: '150px', height: '150px', }} />
                  <div className="btn-container">
                  <button className='btn btn-info' onClick={downloadQr}>Download</button>
                  <button className='btn btn-info' onClick={shareQRCode}>Share</button>
                  </div>
                </div>

                </>
              )}
            </div>
          ) : !userExists && (
            <div className="container" >
              <div>
                <form className='row'>
                  <h3 className='text-center'>Normal Form</h3>
                  <div className="mb-2 col-md-12">
                    <label htmlFor="fname" className="form-label fs-5">First Name : </label>
                    <input type="text" className="form-control" id="f-name" name='fname' onChange={handleChange} />
                    {nameError && <span className="error text-danger">{nameError}</span>}
                  </div>
                  <div className="mb-2 col-md-12">
                    <label htmlFor="l-name" className="form-label fs-5">Last Name :</label>
                    <input type="text" className="form-control" id="lname" name='lname' onChange={handleChange} />
                    {LastnameError && <span className="error text-danger">{LastnameError}</span>}
                  </div>
                  <div className="mb-2 col-md-12">
                    <label htmlFor="mobile-no" className="form-label fs-5">Mobile No :</label>
                    <input type="tel" className="form-control" id="mobileno" name='mobileno' maxLength={10} onChange={handleChange} />
                    {mobileError && <span className="error text-danger">{mobileError}</span>}
                  </div>
                  <div className="mb-3 col-md-12">
                    <label htmlFor="email" className="form-label fs-5">Email :</label>
                    <input type="email" className="form-control" id="email" name='email' onChange={handleChange} />
                    {emailError && <span className="error text-danger">{emailError}</span>}
                  </div>
                  <div className="mb-1 col-12 text-center">
                    <button type="submit" className="btn btn-info text-center col-6" onClick={formSubmit} disabled={isloading}>Submit</button>
                  </div>
                </form>
              </div>
            </div>
          )
        }

        {
          isloading && (
            <>
            <div className="loader">
            </div>
            </>
          )
        }

        {
          userExists && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Error!</strong> Your Email and Mobile No are Already Used.
                <div className="user-existsbtn text-center">
                <button type="button" className="btn btn-danger mt-2" onClick={showlogin}>Ok</button>
                </div>
              </div>
          )
        }
          </div>
      </div>
    </>
  );
};

export default LoginForm;
