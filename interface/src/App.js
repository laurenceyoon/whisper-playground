import React, { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import TranscribeOutput from "./TranscribeOutput";
import SettingsSections from "./SettingsSection";
import { ReactMic } from 'react-mic';
import axios from "axios";
import { PulseLoader } from "react-spinners";

const useStyles = () => ({
  root: {
    display: 'flex',
    margin: '10px 10px 10px 10px',
    flexDirection: 'column',
    color: '#ededf8',
    fontFamily: 'Helvetica Neue',
    fontWeight: 'bold',
    fontStyle: 'oblique'
  },
  header: {
  },
  title: {
    float: 'left',
    textAlign: 'left',
    width: '50%',
  },
  description: {
    float: 'left',
    textAlign: 'right',
    width: '50%',
  },
  originalLyrics: {
    textAlign: 'center',
    fontSize: '44px'
  },
  translationLyrics: {
    textAlign: 'center',
    fontSize: '38px'
  },
  recordIllustration: {
    textAlign: 'center',
  },
  buttonsSection: {
    textAlign: 'center',
    margin: '10px',
  },
});

const App = ({ classes }) => {
  const handle = useFullScreenHandle();

  const [transcribedData, setTranscribedData] = useState([]);
  const [interimTranscribedData, ] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [selectedModel, setSelectedModel] = useState(1);
  const [transcribeTimeout, setTranscribeTimout] = useState(5);
  const [stopTranscriptionSession, setStopTranscriptionSession] = useState(false);  

  const intervalRef = useRef(null);
  
  const stopTranscriptionSessionRef = useRef(stopTranscriptionSession);
  stopTranscriptionSessionRef.current = stopTranscriptionSession;

  const selectedLangRef = useRef(selectedLanguage);
  selectedLangRef.current = selectedLanguage;

  const selectedModelRef = useRef(selectedModel);
  selectedModelRef.current = selectedModel;

  const supportedLanguages = ['english', 'chinese', 'german', 'spanish', 'russian', 'korean', 'french', 'japanese', 'portuguese', 'turkish', 'polish', 'catalan', 'dutch', 'arabic', 'swedish', 'italian', 'indonesian', 'hindi', 'finnish', 'vietnamese', 'hebrew', 'ukrainian', 'greek', 'malay', 'czech', 'romanian', 'danish', 'hungarian', 'tamil', 'norwegian', 'thai', 'urdu', 'croatian', 'bulgarian', 'lithuanian', 'latin', 'maori', 'malayalam', 'welsh', 'slovak', 'telugu', 'persian', 'latvian', 'bengali', 'serbian', 'azerbaijani', 'slovenian', 'kannada', 'estonian', 'macedonian', 'breton', 'basque', 'icelandic', 'armenian', 'nepali', 'mongolian', 'bosnian', 'kazakh', 'albanian', 'swahili', 'galician', 'marathi', 'punjabi', 'sinhala', 'khmer', 'shona', 'yoruba', 'somali', 'afrikaans', 'occitan', 'georgian', 'belarusian', 'tajik', 'sindhi', 'gujarati', 'amharic', 'yiddish', 'lao', 'uzbek', 'faroese', 'haitian creole', 'pashto', 'turkmen', 'nynorsk', 'maltese', 'sanskrit', 'luxembourgish', 'myanmar', 'tibetan', 'tagalog', 'malagasy', 'assamese', 'tatar', 'hawaiian', 'lingala', 'hausa', 'bashkir', 'javanese', 'sundanese']

  const modelOptions = ['tiny', 'base', 'small', 'medium', 'large', 'large-v1']

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);


  function handleTranscribeTimeoutChange(newTimeout) {
    setTranscribeTimout(newTimeout)
  }

  function startRecording() {
    setStopTranscriptionSession(false)
    setIsRecording(true)
    intervalRef.current = setInterval(transcribeInterim, transcribeTimeout * 1000)
  }

  function stopRecording() {
    clearInterval(intervalRef.current);
    setStopTranscriptionSession(true)
    setIsRecording(false)
    setIsTranscribing(false)
  }

  function onData(recordedBlob) {
    console.log('chunk of real-time data is: ', recordedBlob);
  }

  function onStop(recordedBlob) {
    transcribeRecording(recordedBlob)
    setIsTranscribing(true)  
  }

  function transcribeInterim() {
    clearInterval(intervalRef.current);
    setIsRecording(false)
  }

  function transcribeRecording(recordedBlob) {
    const headers = {
      "content-type": "multipart/form-data",
    };
    const formData = new FormData();
    formData.append("language", selectedLangRef.current)
    formData.append("model_size", modelOptions[selectedModelRef.current])
    formData.append("audio_data", recordedBlob.blob, 'temp_recording');
    console.log("formData: ", formData);
    axios.post("http://0.0.0.0:8000/transcribe", formData, { headers })
      .then((res) => {
        setTranscribedData(oldData => [...oldData, res.data])
        setIsTranscribing(false)
        intervalRef.current = setInterval(transcribeInterim, transcribeTimeout * 1000)
      });
      
      if (!stopTranscriptionSessionRef.current){
        setIsRecording(true)    
      }
  }

  return (
    <FullScreen handle={handle}>
      <div className={classes.root}>
        <div className={classes.header}>
          <div className={classes.title}>
            <Typography variant="h6">
              모차르트 마술피리 中 밤의 여왕 아리아
            </Typography>
          </div>
          <div className={classes.description}>
            <Typography variant="span">
              * 스코어 팔로잉 기술을 통해 실시간으로 가사를 추적 중입니다.
            </Typography>
          </div>
        </div>
        <div className={classes.originalLyrics}>
          {/* <TranscribeOutput transcribedText={transcribedData} interimTranscribedText={interimTranscribedData} /> */}
          Wenn nicht, durch die, Sarastroh wird erblassen!
        </div>
        <div className={classes.translationLyrics}>
          {/* <TranscribeOutput transcribedText={transcribedData} interimTranscribedText={interimTranscribedData} /> */}
          만약, 너로 인해, 자라스트로가 죽지 않는다면!
        </div>
        <div className={classes.recordIllustration}>
          <ReactMic record={isRecording} className="sound-wave" onStop={onStop}
            onData={onData} strokeColor="#f6f6ef" backgroundColor="#000000" />
        </div>
        <div className={classes.buttonsSection} >
          {!isRecording && !isTranscribing && <Button onClick={startRecording} variant="primary">Start</Button>}
          {(isRecording || isTranscribing) && <Button onClick={stopRecording} variant="danger" disabled={stopTranscriptionSessionRef.current}>Stop</Button>}
        </div>
        <div className={classes.buttonsSection} >
          <Button onClick={handle.enter} variant="light">full screen</Button>
        </div>
      </div>
    </FullScreen>
  );
}

export default withStyles(useStyles)(App);
