const signaling = new SignalingChannel();
const constraints = { audio: true, video: true };
const configuration = { iceServers: [{ urls: 'stuns:stun.example.org' }] };
const pc = new RTCPeerConnection(configuration);

const $selfVideo = document.getElementById("player");
const $opponentVideo = document.getElementById("opponent");

pc.onicecandidate = ({ candidate }) => signaling.send({ candidate });

pc.onnegotiationneeded = async () => {
    try {
        await pc.setLocalDescription(await pc.createOffer());
        signaling.send({ desc: pc.localDescription });
    } catch (err) {
        console.error(err);
    }
}

pc.ontrack = (event) => {
    if ($opponentVideo) {
        $opponentVideo.srcObject = event.streams[0];
    }
}

async function start() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
            $selfVideo.srcObject = stream;
        })
    } catch (err) {
        console.error(err)
    }

}

signaling.onmessage = async ({ desc, candidate }) => {
    try {
        if (desc) {
            if (desc.type === 'offer') {
                await pc.setRemoteDescription(desc);
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                stream.getTracks().forEach((track) => {
                    pc.addTrack(track, stream);
                })
                await pc, setLocalDescription(await pc.createAnswer());
                signaling.send({ desc: pc.localDescription });
            } else if (desc.type === 'answer') {
                await pc.setRemoteDescription(desc);
            } else {
                console.log('Unsupported SDP type');
            }
        } else if (candidate) {
            await pc.addIceCandidate(candidate);
        }
    } catch (err) {
        console.error(error);
    }
}