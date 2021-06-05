# Graduation Project
> IoT 장치의 동작 무결성 검증을 위한 네트웍 패킷 스니핑 및 로깅 시스템 개발

## 개요
IoT 분야가 빠르게 발전하고 있는 요즘, 일반 가정집에서도 쉽게 IoT 기기를 찾을 수 있을 만큼 IoT는 대중화되었다. 사용자는 스마트폰의 SmartThings 어플로 쉽게 전등을 끄거나 킬 수 있고 에어컨을 조절할 수 있다. 즉, 단말기(ex 스마트폰)는 SmartThings(ST) 환경에서 IoT 장치(ex 전등)를 제어할 수 있다. 이 경우 거리에서는 BLE 통신(블루투스를 생각하면 된다)을 이용하고 장거리의 경우 BLE 통신을 사용할 수 없어 ST-Hub를 통해 제어한다. 이 경우 Hub는 근거리 통신으로 IoT 장치에 제어 명령을 보낼 수 있다.

하지만 만약 IoT 장치가 제대로 작동하지 않는다면 어떻게 할까? 이 경우 원인을 찾아내야 하는데 네트워크 상의 문제일 수도, IoT 장치 자체의 문제일 수도 있기 때문에 검증하기 쉽지 않다. 따라서 우리는 원인을 네트워크 상에 초점을 두어 무결성을 검증하는 것을 목적으로 둔다.

네트워크 상의 무결성을 검증하기 위해 우리는 패킷 스니핑 기술을 이용한다. 패킷은 정보 기술에서 패킷 방식의 컴퓨터 네트워크가 전달하는 데이터의 형식화된 블록을 말한다. 또한 스니핑은 스니퍼를 이용하여 네트워크상의 데이터를 도청하는 행위를 말한다. 즉 패킷 스니핑이란 네트워크의 일부를 통해 전달되는 트래픽을 가로채거나 기록할 수 있는 도구를 활용해 네트워크 통신 내용을 몰래 도청하는 행위이다.

이 프로젝트의 최종 목표는 단말기가 IoT 장치를 제어하는 과정에서 각 노드들 사이에 이동하는 패킷들을 수집하여(패킷 스니핑을 이용하여) log 들을 기반으로 무결성을 검증해주는 리포트를 생성하는 웹어플리케이션을 제작하는 것이다. 수집한 패킷을 통해 무결성을 검증하며 로그를 살펴볼 수 있는 웹어플리케이션을 개발할 것이다.

--------------------------------

## 수행 내용
## 1. zigbee 통신
![슬라이드4](https://user-images.githubusercontent.com/42240771/120900045-c859df00-c66d-11eb-8560-99df7ade1ba7.PNG)
다음은 Zigbee를 이용해서 Wafer를 조작할 때, 통신이 일어나는 과정이다. 여기서 SmartPhone과 Hub는 모두 네트워크에 연결되어 있는 상태다.

SmartPhon에서 LED ON이라는 요청을 보내면, 이 요청이 SmartThings Cloud로 가게 된다. 그리고 Cloud로 들어온 Command는 Hub로 전달된다. Hub에서 이 요청을 Wafer에 Zigbee로 보낸다. Zigbee 통신에서 SmartPhone과 SmartThings Cloud간의 통신은 wifi로 이루어지고, Hub와 Cloud간의 통신은 Zigbee로 이루어진다. 

우리는 이 구간 중 smartPhone과 cloud간의 wifi구간과 hub와 Wafer의 Zigbee구간에 대해 sniffing을 진행했다.
![슬라이드5](https://user-images.githubusercontent.com/42240771/120900230-ac0a7200-c66e-11eb-9d3d-394d13fb91c6.PNG)
Zigbee packet은 wireshark를 이용해 zigbee network key를 찾아 복호화를 진행했다.
위 이미지는 복호화한 packet을 바탕으로 command 과정을 분석한 것이다.

Wafer 조작에 대해 On/Off, Level Control, color temperature control의 명령이 있다.
packet 송/수신 과정은 command에 따라 조금씩 상이하다.

그 예시 중 하나인 On/Off의 경우 처음에 Hub에서 Wafer로 On packet이 전달되면, LED는 Report Attributes를 통해 update된 자신의 상태 정보를 알려준다. 여기서 상태 정보가 올바르게 update되면, 동작이 잘된 것이다. 1번 packet에 대한 response가 3번이고, 2번 packet에 대한 response가 4번 packet이다. Default response는 packet을 잘 받았음을 확인해주는 packet이라고 판단해, 이는 무결성 검증에 사용하지는 않았다.
![슬라이드6](https://user-images.githubusercontent.com/42240771/120900299-13c0bd00-c66f-11eb-9ff0-e0f06dfb70cf.PNG)
다른 command들도 on/off와 기본적인 방식은 유사하나 약간의 차이가 있다. Level control command는 Move to level with OnOff라는 packet이 가고 Report Attributes를 통해 update된 Wafer의 상태 정보를 확인할 수 있다
![슬라이드7](https://user-images.githubusercontent.com/42240771/120900319-2dfa9b00-c66f-11eb-9c6f-9024a3501613.PNG)
ColorTemperature Command는 처음에 On packet이 가고, Move to Color Temperature이라는 packet이 간다. 그리고 2초 정도의 시간이 지난 뒤, Read Attribures라는 packet을 Hub가 직비에 보내면, Wafer는 Read Attributes Response라는 packet으로 응답하며, update된 Wafer의 상태 정보를 파악할 수 있다.
이따 Response가 1.5초에서 2초정도 뒤에 오는데 이는 Color temperature를 변경할 때만 나타난다. 따라서 코드를 짤 때 Color가 바뀌는데 걸리는 시간을 고려해서 setting을 해줬다.
![슬라이드8](https://user-images.githubusercontent.com/42240771/120900398-8b8ee780-c66f-11eb-9fc3-644cb8f81ec0.PNG)
무결성 검증을 위해 sniffing하려고 했던 구간은 다음과 같다.

1번은 핸드폰과 cloud 사이의 wifi구간이고, 2번은 Hub와 Wafer의 Zigbee구간이다. 1번 구간 sniffing을 통해 command가 cloud로 잘 전달되고, 결국 2번 구간에서 Wafer의 동작이 올바르게 일어났는지 확인하는 방식으로 IoT기기의 동작 무결성을 검증하려고 했다.

Zigbee packet은 앞서 말한 대로 복호화가 잘 되어 packet 분석을 할 수 있었다.
하지만, wifi packet을 sniffing후, 복호화하는 과정에서 어려움이 있었다. 복호화가 되지 않았는데 그 이유는 제 3의 기관에서 받은 인증서로 packet이 암호화되어 있기 때문이라고 확인할 수 있었다. Smartthings application내에 인증서가 존재하는 형태로, packet sniffing을 한 후에 복호화를 진행할 수 없어 packet 내용은 확인할 수 없었고, packet 전달 여부만 확인 가능했다.

그래서 이 부분은 전달 여부만 확인하고, smartthings cloud ide의 log 기록을 활용하기로 결정했다. Log 기록을 Zigbee sniffing 한 packet 내용과 비교해 무결성을 검증했다.

정의한 에러 상황은 다음과 같다. 
> Cloud에는 로그가 남아있지 않는데, 특정 command에 대해 packet sniffing이 되었을 경우 에러 
* Report attribute에서 LED상태가 변경되지 않았을 경우 – LED가 command에 따라 update되지 않았으므로, 에러
* Report attribute가 오지 않았을 경우에도 에러
* Default response에서 상태 정보도 올바르게 update되었지만, Cloud에 기록되지 않은 경우도 에러
 
Cloud의 log는 Wafer가 Command에 따라 올바르게 잘 동작하였음이 확인되고 난 뒤에 기록된다. 따라서 이 경우는 cloud로 wafer의 동작이 전달되지 않은 경우라고 판단했다.

이와 반대로 Cloud에 log가 남아있는데, packet sniffing이 되지 않았을 경우는 에러라고 판단하지 않았다. 우리는 다양한 에러 상황을 수집하고자 빠르게 wafer를 작동시켰다. 많은 packet 전달로 인해 해당 packet을 잡지 못하는 경우가 발생할 수 있기 때문입니다. 

## 2. BLE 통신
![슬라이드13](https://user-images.githubusercontent.com/42240771/120900672-12908f80-c671-11eb-8377-c75d3be45029.PNG)
다음은 BLE 무결성 검증이다.
BLE 통신은 Zigbee에 비해 통신 과정이 비교적 간단하다. Smart Phone에서 직접 Wafer를 작동시키는 형태이다. 이 사이의 BLE packet을 sniffing했다. 
![슬라이드14](https://user-images.githubusercontent.com/42240771/120900695-348a1200-c671-11eb-9711-576c7029f375.PNG)
다음은 BLE comman를 분석한 내용이다. Phone에서 wafer로 sent write request를 보낸다.
Btatt.handle이 0x002d인 packet이 on/off를 하는 packet이다.

그리고 Empty PDU가 master와 slave사이에서 한 번씩 전달되고, update된 상태가 Read Write Response의 btatt.value를 통해 전달된다.
![슬라이드15](https://user-images.githubusercontent.com/42240771/120900716-508db380-c671-11eb-99c7-05f183021482.PNG)
BLE 통신에서의 packet sniffing에는 개발에 한계가 있었다.

우선, Smarththings 의 BLE통신은 On/Off시에만 상태 정보를 update해주어서, On/Off를 통해서만 LED가 올바르게 작동했는지 확인할 수 있었다. Beacon data를 활용하는 방법이 있지만 sniffing 기기가 두개 필요하다. 가지고 있던 Sniffer가 한 개였기 때문에, 논의 결과 Master-Slave간의 packet만 sniffing하기로 했다. 그래서 자신의 상태 정보를 update해주는 on/off command에 대해서만 무결성을 검증할 수 있었다.

또한, 프로젝트를 진행하던 도중 문제 상황이 한가지 더 발생했다, Wafer의 firmware가 업데이트 되면서 wireshark에는 BLE sniffing이 이루어지지 않는 문제가 발생했다.
따라서 이 프로젝트는 우리가 이전에 sniffing을 해 두었던 On/Off packet 기반으로 무결성을 검증했다.

## 결과
### 프로젝트 실행
<pre>
npm install
npm start
</pre>
![슬라이드9](https://user-images.githubusercontent.com/42240771/120900836-24befd80-c672-11eb-8e61-8c908f2e98bc.PNG)
> Zigbee를 선택하고 성공한 패킷을 선택했을 경우

![슬라이드10](https://user-images.githubusercontent.com/42240771/120900854-402a0880-c672-11eb-9ecf-037f8a48171b.PNG)
> Zigbee를 선택하고 실패한 패킷을 선택했을 경우 (Wrong Read Attribute Response)

![슬라이드11](https://user-images.githubusercontent.com/42240771/120900874-62bc2180-c672-11eb-9a9d-231400ac8e82.PNG)
> Zigbee를 선택하고 실패한 패킷을 선택했을 경우 (No Report Attribute)

![슬라이드12](https://user-images.githubusercontent.com/42240771/120900893-7a93a580-c672-11eb-9d8e-e7611cf07077.PNG)
> Zigbee를 선택하고 실패한 패킷을 선택했을 경우 (Fail to write in cloud)

![슬라이드16](https://user-images.githubusercontent.com/42240771/120900912-8d0ddf00-c672-11eb-88a7-1a1908dca011.PNG)
> BLE를 선택하고 성공한 패킷을 선택했을 경우

![슬라이드17](https://user-images.githubusercontent.com/42240771/120900922-9e56eb80-c672-11eb-81b8-4147f58ed4d1.PNG)
> BLE를 선택하고 실패한 패킷을 선택했을 경우

## 결론
> 좀더 상세한 내용은 노션에 작성하였다. https://www.notion.so/0df3858cb2364fa7a9b3de772408392c

이번 프로젝트를 진행하며 학교 수업, 특히 네트워크 수업 때 학습하였던 내용을 직접 프로젝트에서 활용해 볼 수 있었다. 패킷을 주고받는 방식, 무선 네트워크 그리고 BLE 통신과 Zigbee 통신 각각의 키워드에 대해서 공부할 수 있는 기회가 되었다. 또한, 와이어샤크라는 툴을 써볼 수 있어서 좋았고 앞으로 프로젝트를 진행하는 것에 있어서 좋은 경험이 되었다.

이 프로젝트의 결과물인 무결성 검증 웹어플리케이션을 통해 사용자와 IoT 장치 간 명령/응답 전달과정 및 동작에 대한 무결성 검증을 할 수 있다. 이 웹어플리케이션은 에러 발생 구간 및 command의 비율 정보를 제공한다. 즉, Zigbee와 BLE 통신 과정을 모르더라도 에러를 확인할 수 있다. 따라서 이는 장치 test에 활용할 수 있을 뿐만 아니라 개발 과정에서의 에러 확인도 가능하다. 

