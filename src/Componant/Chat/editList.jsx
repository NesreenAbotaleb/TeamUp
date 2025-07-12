import style from './style.module.css';
import { ReactComponent as Delete } from './../../assets/svgs/trash.svg';
import { ReactComponent as Edit } from './../../assets/svgs/icons/Edit.svg';
import { ReactComponent as Download } from './../../assets/svgs/icons/Download.svg';
import { ReactComponent as Reply } from './../../assets/svgs/icons/reply-solid.svg';

function EditList(props) {
    const { setEdit, setDelete, isFile, isImage, onReply, isCurrentUser } = props;


    const handleEditClick = () => {
        if (setEdit) {
            setEdit();
        }
    };

    const handleDeleteClick = () => {
        if (setDelete) {
            setDelete();
        }
    };

    const handleDownloadClick = () => {
        if (isFile) {
            const content = "This is the content of the file!";
            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "example.txt"; // file name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // clean up
        } else {
            const canvas = document.createElement("canvas");
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext("2d");

            // Draw something
            ctx.fillStyle = "orange";
            ctx.fillRect(0, 0, 200, 200);
            ctx.fillStyle = "black";
            ctx.font = "20px Arial";
            ctx.fillText("Hello!", 50, 100);

            // Create a link and trigger download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "myCanvasImage.png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            });
        }

    }

    return (
        <div className={style.Container}>
            {/* <button
                className={style.edBTN}
                onClick={handleEditClick}
            >
                <Edit />
                <span>Edit</span>
            </button> */}
            {(isFile || isImage) && (
                <button
                    className={style.edBTN}
                    onClick={handleDownloadClick}
                >
                    <Download />
                    <span>Download</span>
                </button>
            )}
            {/* <button
                className={style.edBTN}
                onClick={handleDeleteClick}
            >
                <Delete />
                <span>Delete</span>
            </button> */}

            {isCurrentUser && (
                <button className={style.edBTN} onClick={handleEditClick}>
                    <Edit />
                    <span>Edit</span>
                </button>
            )}

            {isCurrentUser && (
                <button className={style.edBTN} onClick={handleDeleteClick}>
                    <Delete />
                    <span>Delete</span>
                </button>
            )}


            {/* <button
                className={style.edBTN}
                onClick={() => onReply && onReply()}
            >
                <Reply />
                <span>Reply</span>
            </button> */}
            <button
                className={style.edBTN}
                onClick={() => onReply && onReply()}
            >
                <Reply />
                <span>Reply</span>
            </button>


        </div>
    );
}

export default EditList;